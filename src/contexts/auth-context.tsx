import { createContext, useContext } from "react";

export const UserRole = { GUEST: "guest", RESIDENT: "resident", CONCIERGE: "concierge", ADMIN: "admin" } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  isPending: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  role: "guest",
  name: "",
  isPending: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);
