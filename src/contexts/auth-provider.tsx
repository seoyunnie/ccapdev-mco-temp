import type { ReactNode } from "react";

import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";

import { authClient } from "../lib/auth-client.ts";
import { type UserRole, AuthContext } from "./auth-context.tsx";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const signOut = useMemo(
    () => async () => {
      await authClient.signOut();
      void router.navigate({ to: "/login" });
    },
    [router],
  );

  const value = useMemo(
    () => ({
      isLoggedIn: !!session?.user,
      role: (session?.user?.role as UserRole) ?? "guest",
      name: session?.user?.name ?? "",
      isPending,
      signOut,
    }),
    [session, isPending, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
