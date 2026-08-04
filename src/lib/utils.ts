import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Five seconds of confetti for a clean sweep of the end-of-lesson quiz.
 *
 * The reduced-motion check has to live here. This draws to a canvas on
 * `requestAnimationFrame`, so `globals.css`'s `prefers-reduced-motion` block —
 * which only kills CSS animations and transitions — cannot touch it, and
 * without this guard the largest motion event on the site is the one thing
 * with no opt-out. Skipping it costs nothing: the quiz says "6 of 6 right"
 * either way.
 */
export function quizWinConfetti() {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  // Above the rail (z-40) and the analytics banner (z-50); the canvas is
  // pointer-events: none, so nothing under it stops working.
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 70 };
  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}
