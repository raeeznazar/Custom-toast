/**
 * The store is plain module state + a subscriber list (a manual "pub-sub"), not a library.
 * `ToastProvider` reads it with React's own `useSyncExternalStore` (built into React 18+),
 * which is exactly what state-management libraries like Zustand do internally — this just
 * skips the library.
 */

export type ToastTone = "default" | "info" | "warning" | "success" | "error";

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
}

type Listener = () => void;

let currentToast: ToastState | null = null;
let nextId = 0;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Used internally by `ToastProvider` — you don't need to call this yourself. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Used internally by `ToastProvider` — you don't need to call this yourself. */
export function getSnapshot(): ToastState | null {
  return currentToast;
}

/**
 * Show a toast from anywhere in your app — a screen, a hook, an API error handler — without
 * needing to be inside a React component.
 *
 * @param message    Text to display.
 * @param tone       One of 'default' | 'info' | 'warning' | 'success' | 'error'. Defaults to 'default'.
 * @param durationMs How long the toast stays visible before it auto-hides. Defaults to 2400ms.
 */
export function showToast(
  message: string,
  tone: ToastTone = "default",
  durationMs = 2400,
): void {
  currentToast = { id: ++nextId, message, tone, durationMs };
  emit();
}

/** Hide the current toast immediately (skips the fade-out). */
export function hideToast(): void {
  currentToast = null;
  emit();
}
