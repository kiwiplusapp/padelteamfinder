"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* ============================================================================
   Hero WebGL scene.

   A regulation padel court drawn as a glass cage in perspective, with a field
   of balls drifting through it. The scene answers one question the hero poses
   ("where do I play?") rather than being decoration: the cage is the actual
   20x10 court geometry, and the balls carry the brand accent.

   Isolation rules honoured here:
     - Three never shares a component tree with Motion, they fight for frames.
     - All animation runs in useFrame against refs, never React state.
     - Geometries and materials are memoised, so HMR does not leak GPU objects.
     - Reduced motion is handled by the caller, which renders a still frame.
   ========================================================================== */

const COURT_LENGTH = 20;
const COURT_WIDTH = 10;
const WALL_HEIGHT = 4;
const BALL_COUNT = 58;

const VOLT = new THREE.Color("#d4f31e");
const PAPER = new THREE.Color("#f4f2ea");

/** The glass cage, drawn as edges so it reads as structure, not as a solid. */
function CourtCage() {
  const geometry = useMemo(() => {
    const group = new THREE.BufferGeometry();
    const points: number[] = [];

    const hl = COURT_LENGTH / 2;
    const hw = COURT_WIDTH / 2;

    const push = (a: number[], b: number[]) => points.push(...a, ...b);

    // Floor outline
    push([-hl, 0, -hw], [hl, 0, -hw]);
    push([hl, 0, -hw], [hl, 0, hw]);
    push([hl, 0, hw], [-hl, 0, hw]);
    push([-hl, 0, hw], [-hl, 0, -hw]);

    // Service lines and centre line, the real court markings
    push([-hl + 3, 0, -hw], [-hl + 3, 0, hw]);
    push([hl - 3, 0, -hw], [hl - 3, 0, hw]);
    push([-hl + 3, 0, 0], [hl - 3, 0, 0]);
    push([0, 0, -hw], [0, 0, hw]);

    // Back walls
    [-hl, hl].forEach((x) => {
      push([x, 0, -hw], [x, WALL_HEIGHT, -hw]);
      push([x, 0, hw], [x, WALL_HEIGHT, hw]);
      push([x, WALL_HEIGHT, -hw], [x, WALL_HEIGHT, hw]);
    });

    // Side fencing uprights
    for (let i = -hl; i <= hl; i += 4) {
      push([i, 0, -hw], [i, WALL_HEIGHT * 0.75, -hw]);
      push([i, 0, hw], [i, WALL_HEIGHT * 0.75, hw]);
    }
    push([-hl, WALL_HEIGHT * 0.75, -hw], [hl, WALL_HEIGHT * 0.75, -hw]);
    push([-hl, WALL_HEIGHT * 0.75, hw], [hl, WALL_HEIGHT * 0.75, hw]);

    // The net
    push([0, 0, -hw], [0, 1, -hw]);
    push([0, 0, hw], [0, 1, hw]);
    push([0, 1, -hw], [0, 1, hw]);

    group.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    );
    return group;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: PAPER,
        transparent: true,
        opacity: 0.4,
      }),
    [],
  );

  return <lineSegments geometry={geometry} material={material} />;
}

/** Drifting padel balls. Instanced so 46 of them cost one draw call. */
function BallField({ still }: { still: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: BALL_COUNT }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        y: (Math.sin(i * 78.233) * 12345.6789) % 1,
        z: (Math.sin(i * 39.425) * 24631.9876) % 1,
        speed: 0.25 + ((Math.sin(i * 4.11) + 1) / 2) * 0.5,
        scale: 0.14 + ((Math.sin(i * 7.77) + 1) / 2) * 0.16,
      })),
    [],
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VOLT,
        roughness: 0.9,
        metalness: 0,
        // Emissive carries the colour so the balls stay volt at every depth
        // instead of falling to olive wherever the key light does not reach.
        emissive: VOLT,
        emissiveIntensity: 0.85,
      }),
    [],
  );

  const write = (time: number) => {
    if (!mesh.current) return;
    seeds.forEach((s, i) => {
      const drift = still ? 0 : time * s.speed;
      dummy.position.set(
        ((s.x * 2 - 1) * COURT_LENGTH) / 1.6,
        ((s.y * 2 - 1) * WALL_HEIGHT) / 1.1 +
          Math.sin(drift + i) * (still ? 0 : 0.35) +
          1.4,
        ((s.z * 2 - 1) * COURT_WIDTH) / 1.4,
      );
      dummy.scale.setScalar(s.scale);
      dummy.rotation.set(drift * 0.6, drift * 0.4, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  };

  useFrame(({ clock }) => write(still ? 0 : clock.elapsedTime));

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, BALL_COUNT]}
      frustumCulled={false}
    />
  );
}

/**
 * Frame the court for the viewport it is actually in. A phone is far taller
 * than it is wide, so the default camera crops the cage to a few stray lines.
 * Pulling back and lifting on narrow aspects keeps the whole court in shot.
 */
function ResponsiveCamera() {
  // The camera is read off the frame state rather than captured from useThree:
  // mutating a value a hook returned is exactly what the compiler rules flag,
  // and the per-frame state hands back the same objects anyway.
  useFrame((state) => {
    const aspect = state.size.width / state.size.height;
    const z = aspect < 0.8 ? 30 : aspect < 1.3 ? 22 : 15;
    const y = aspect < 0.8 ? 6 : aspect < 1.3 ? 4.4 : 3.2;

    // Ease rather than snap, so a rotation or a resize does not jump.
    state.camera.position.z += (z - state.camera.position.z) * 0.08;
    state.camera.position.y += (y - state.camera.position.y) * 0.08;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * Parallax. The whole scene leans toward the pointer, which gives the hero
 * depth without hijacking scroll or costing a React render per frame.
 */
function Rig({ still, showCage }: { still: boolean; showCage: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (still) {
      group.current.rotation.set(-0.22, 0.42, 0);
      return;
    }
    target.set(pointer.x, pointer.y);
    const damp = 1 - Math.pow(0.001, delta);
    group.current.rotation.y += (0.42 + target.x * 0.22 - group.current.rotation.y) * damp;
    group.current.rotation.x += (-0.22 - target.y * 0.12 - group.current.rotation.x) * damp;
  });

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {/* Suppressed when a photograph of a real court is already the field. */}
      {showCage && <CourtCage />}
      <BallField still={still} />
    </group>
  );
}

export default function CourtScene({
  still = false,
  showCage = true,
}: {
  still?: boolean;
  showCage?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 3.2, 15], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={still ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} />
      <directionalLight position={[-8, 2, -6]} intensity={0.4} color={VOLT} />
      <ResponsiveCamera />
      <Rig still={still} showCage={showCage} />
      <fog attach="fog" args={["#0a1a4f", 30, 62]} />
    </Canvas>
  );
}
