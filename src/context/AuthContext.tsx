import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "guest" | "resident" | "concierge" | "admin";

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  role: "guest",
  name: "",
  login: () => {},
  logout: () => {},
});

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

export const useAuth = () => useContext(AuthContext);
