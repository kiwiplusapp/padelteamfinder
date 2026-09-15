"use client";

import { motion, useReducedMotion } from "motion/react";

/* ----------------------------------------------------------------------------
   Scroll reveal.

   Motion's whileInView rather than a ScrollTrigger: these sections only need
   "appear once on entry", and IntersectionObserver is far cheaper than a
   scrubbed timeline. GSAP is reserved for the sections that actually pin.

   Justification for the motion, per the "motion must be motivated" rule: entry
   order matches reading order, so the eye is led down the page rather than
   landing on a wall of finished content.
   -------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children. Parent and children share one client tree. */
export function RevealGroup({
  children,
  stagger = 0.07,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
