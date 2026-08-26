"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Wraps next-themes so dark mode preference persists across visits
// (stored by next-themes itself) and respects the user's system
// preference by default until they explicitly toggle it.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
