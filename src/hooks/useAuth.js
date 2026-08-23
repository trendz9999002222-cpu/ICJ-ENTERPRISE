import { useContext } from "react";
import AuthContext from "../contexts/auth-context";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    // Return safe graceful fallback state to avoid unhandled crashes
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      setSessionUser: () => {},
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      requestRecovery: async () => {},
      hasAccess: () => false,
    };
  }

  return context;
}

export default useAuth;
