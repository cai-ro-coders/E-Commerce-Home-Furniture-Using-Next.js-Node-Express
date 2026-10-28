'use client';

import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { StoreProvider } from './StoreProvider';
import { StoreUIProvider } from './StoreUIProvider';

/**
 * Single mount point for every client-side context.
 *
 * Order matters: `StoreProvider` reads the signed-in user to decide whether to
 * load a cart, so it has to sit inside `AuthProvider`.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <StoreUIProvider>{children}</StoreUIProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
