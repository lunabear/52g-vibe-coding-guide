import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UI 상수
export const UI_CONSTANTS = {
  animation: {
    defaultDurationMs: 600,
    shortDurationMs: 300,
  },
  grid: {
    gapX: 'gap-x-6',
    gapY: 'gap-y-12',
  }
} as const