// context/authContext.tsx
"use client";

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  loginSource: "admin" | "tenant";
};

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: any;
  login: (
    email: string,
    role: "admin" | "tenant",
    token: string,
    loginSource: "admin" | "tenant"
  ) => void;
  logout: () => void;
  updateUser: (updates: Partial<any>) => void;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchUser = async (email: string) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/get-user-details/${email}`
      );
      setUser(res.data.user);
      return true;
    } catch (error) {
      console.log("Error fetching user:", error);
      return false;
    }
  };

const login = (
  email: string,
  role: string,
  token: string,
  loginSource?: "admin" | "tenant"
) => {
  const source = loginSource ?? (role === "admin" || role === "Admin" ? "admin" : "tenant");

  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_email", email);
  localStorage.setItem("auth_role", role);
  localStorage.setItem("auth_login_source", source);

  // Clean up cross-session pollution
  if (source === "admin") {
    localStorage.removeItem("tenant_token");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("tenant_logged_in");
    localStorage.removeItem("lastVisitedPath");
  } else {
    localStorage.removeItem("auth_last_path");
    localStorage.removeItem("admin_last_path");
    localStorage.removeItem("lastVisitedPath");
  }

  setUser({ email, role, loginSource: source });
  fetchUser(email).finally(() => setLoading(false));
};

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_login_source");
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const updateUser = (updates: Partial<any>) => {
  setUser((prev: any) => prev ? { ...prev, ...updates } : prev);
};
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const email = localStorage.getItem("auth_email");
      const role = localStorage.getItem("auth_role");
    const loginSource = (() => {
  const v = localStorage.getItem("auth_login_source");
  if (!v || v === "undefined" || v === "null") return null;
  return v as "admin" | "tenant";
})();
      
      if (token && email && email !== "null" && email !== "undefined") {
        // Set minimal user immediately to prevent flash before fetchUser resolves
      setUser({ email, role, loginSource: loginSource ?? (role === "admin" || role === "Admin" ? "admin" : "tenant") });
        await fetchUser(email);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const can = (permission: string): boolean => {
    if (!user) return false;
    const role = user?.role_name ?? user?.role ?? null;
    if (role === "admin" || role === "Admin") return true;
    const hasCustom = user?.has_custom_permissions;
    if (hasCustom) {
      const rolePerms: Record<string, boolean> = user?.role_permissions ?? {};
      const userPerms: Record<string, boolean> = user?.permissions ?? {};
      const merged = { ...rolePerms, ...userPerms };
      return Boolean(merged[permission]);
    } else {
      const rolePerms: Record<string, boolean> = user?.role_permissions ?? {};
      return Boolean(rolePerms[permission]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        can,
         updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}