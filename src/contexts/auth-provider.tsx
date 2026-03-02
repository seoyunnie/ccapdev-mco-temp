import { type ReactNode, useState } from "react";

import { type UserRole, AuthContext } from "./auth-context.tsx";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [name, setName] = useState("");

  const login = (r: UserRole, n = "Resident") => {
    setIsLoggedIn(true);
    setRole(r);
    setName(n);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole("guest");
    setName("");
  };

  return <AuthContext value={{ isLoggedIn, role, name, login, logout }}>{children}</AuthContext>;
}
