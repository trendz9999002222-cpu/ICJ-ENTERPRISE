/**
 * ICJ Enterprise Platform
 * Authentication Context
 * Version : 1.0.0
 */

import { createContext, useEffect, useState, useCallback } from "react";
import AuthService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentSession = await AuthService.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          setProfile(currentUser?.profile || null);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("[AuthContext] Failed to initialize auth:", err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribe = AuthService.onAuthStateChange(async (event, newSession) => {
      try {
        setSession(newSession);
        if (newSession?.user) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          setProfile(currentUser?.profile || null);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("[AuthContext] Auth state sync failed:", err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => { unsubscribe(); };
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setUser(result.user);
      setProfile(result.profile || result.user?.profile || null);
      setSession(result.session);
      return result;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await AuthService.register(userData);
      setUser(result.user);
      setProfile(result.profile || result.user?.profile || null);
      setSession(result.session);
      return result;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally { setLoading(false); }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;
    try {
      const updated = await AuthService.updateProfile(user.id, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error("[AuthContext] updateProfile failed:", err);
      throw err;
    }
  }, [user]);

  const getMySessions = useCallback(async (filters = {}) => {
    return AuthService.getMySessions(filters);
  }, []);

  const revokeOwnSession = useCallback(async (sessionReference, reason = "") => {
    return AuthService.revokeOwnSession(sessionReference, reason);
  }, []);

  const revokeOtherSessions = useCallback(async (reason = "") => {
    return AuthService.revokeOtherSessions(reason);
  }, []);

  const getMyTrustedDevices = useCallback(async (filters = {}) => {
    return AuthService.getMyTrustedDevices(filters);
  }, []);

  const revokeOwnTrustedDevice = useCallback(async (deviceReference, reason = "") => {
    return AuthService.revokeOwnTrustedDevice(deviceReference, reason);
  }, []);

  const value = {
    user, profile, session, loading,
    login, register, logout, updateProfile,
    getMySessions, revokeOwnSession, revokeOtherSessions,
    getMyTrustedDevices, revokeOwnTrustedDevice,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

