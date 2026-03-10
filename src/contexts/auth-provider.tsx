import { useRouter } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

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
      isLoggedIn: Boolean(session?.user),
      // oxlint-disable-next-line no-unsafe-type-assertion -- Better Auth doesn't type custom user fields
      role: ((session?.user as Record<string, unknown>)?.role as UserRole) ?? "guest",
      name: session?.user?.name ?? "",
      image: (session?.user?.image as string | null) ?? null,
      isPending,
      signOut,
    }),
    [session, isPending, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
