"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";

/** Watches for the current user becoming blocked and signs them out. */
function BlockedUserWatcher() {
  const { user, signOut } = useAuth();
  const wasBlockedRef = useRef(false);

  useEffect(() => {
    if (user?.isBlocked && !wasBlockedRef.current) {
      wasBlockedRef.current = true;
      void signOut();
      toast.error("Your account has been blocked by an administrator.");
    }
    if (!user?.isBlocked) wasBlockedRef.current = false;
  }, [user, signOut]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <BlockedUserWatcher />
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}
