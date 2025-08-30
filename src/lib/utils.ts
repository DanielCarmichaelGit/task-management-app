import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Global refetch function that can be called from anywhere
export const triggerGlobalTaskRefetch = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tasks:refetch"));
  }
};
