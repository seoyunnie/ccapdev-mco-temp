import { useRouter } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { getSessionStateFn } from "../server/auth.ts";
import { authClient } from "./auth-client.ts";
import { type UserRole, AuthContext } from "./auth-context.tsx";

function isUserRole(value: unknown): value is UserRole {
  return value === "guest" || value === "resident" || value === "concierge" || value === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [serverRole, setServerRole] = useState<UserRole>("guest");
  const [serverProfile, setServerProfile] = useState<{ name: string; image: string | null }>({ name: "", image: null });
  const [isSessionStatePending, setIsSessionStatePending] = useState(true);

  useEffect(() => {
    let disposed = false;

    const syncSessionState = async () => {
      setIsSessionStatePending(true);
      try {
        const sessionState = await getSessionStateFn();
        if (disposed) {
          return;
        }

        if (sessionState.session?.user == null) {
          setServerRole("guest");
          setServerProfile({ name: "", image: null });
          return;
        }

        const role = Reflect.get(sessionState.session.user, "role");
        setServerRole(isUserRole(role) ? role : "guest");
        setServerProfile({
          name: sessionState.session.user.name ?? "",
          image: typeof sessionState.session.user.image === "string" ? sessionState.session.user.image : null,
        });
      } finally {
        if (!disposed) {
          setIsSessionStatePending(false);
        }
      }
    };

    void syncSessionState();

    return () => {
      disposed = true;
    };
  }, [session?.user?.id]);

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
      role: serverRole,
      name: serverProfile.name,
      image: serverProfile.image,
      isPending: isPending || isSessionStatePending,
      signOut,
    }),
    [session, serverRole, serverProfile, isPending, isSessionStatePending, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
