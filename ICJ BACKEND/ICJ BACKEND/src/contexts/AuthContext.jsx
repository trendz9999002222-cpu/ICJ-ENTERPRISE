import { useEffect, useState } from "react";
import AuthService from "../services/authService";
import InitService from "../services/initService";
import AuthContext from "./auth-context";
import RoleService from "../services/roleService";



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    InitService.initializeSystem()
      .then(() => AuthService.getCurrentUser())
      .then((sessionUser) => {
        if (!active) return;
        setUser(sessionUser);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const sessionUser = await AuthService.login(credentials);
    setUser(sessionUser);
    return sessionUser;
  };

  const register = async (payload) => {
    const sessionUser = await AuthService.register(payload);
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const hasAccess = (moduleId) => {
    const role = String(user?.role || "member").toLowerCase();
    return RoleService.hasAccess(role, moduleId);
  };


  const requestRecovery = async (payload) => {
    return await AuthService.requestRecovery(payload);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    setSessionUser: (userObj) => setUser(userObj),
    login,
    register,
    logout,
    requestRecovery,
    hasAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from "../hooks/useAuth";
export default AuthProvider;
