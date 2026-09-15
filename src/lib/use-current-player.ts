"use client";

import { useCallback, useSyncExternalStore } from "react";

/* ----------------------------------------------------------------------------
   Who is using the app.

   There is no authentication yet, and pretending otherwise would hide the work
   still to do. The player identifies themselves once and the choice is kept in
   localStorage. Every write endpoint already takes an explicit playerId, so
   wiring a real session later means replacing this hook and nothing else.

   localStorage is an external store, so it is read through useSyncExternalStore
   rather than an effect: that keeps the server and first client render in
   agreement and avoids a cascading re-render on mount.
   -------------------------------------------------------------------------- */

const KEY = "padelparty:player-id";
const EVENT = "padelparty:player-changed";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in step.
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener(EVENT, listener);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    // Private mode or blocked storage: the picker simply asks every time.
    return null;
  }
}

/** On the server nobody is signed in, which is also the pre-hydration truth. */
function getServerSnapshot(): string | null {
  return null;
}

export function useCurrentPlayer() {
  const playerId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const choose = useCallback((id: string) => {
    try {
      window.localStorage.setItem(KEY, id);
    } catch {
      // Non-fatal: the selection is simply not remembered.
    }
    window.dispatchEvent(new Event(EVENT));
    emit();
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // Non-fatal.
    }
    window.dispatchEvent(new Event(EVENT));
    emit();
  }, []);

  /**
   * True once the client snapshot is authoritative. Consumers use it to hold
   * back a picker for one paint instead of flashing the wrong state.
   */
  const ready = typeof window !== "undefined";

  return { playerId, choose, clear, ready };
}
