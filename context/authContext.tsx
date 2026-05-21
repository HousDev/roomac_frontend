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
    loginSource: "admin" | "tenant"
  ) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_email", email);
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_login_source", loginSource);
    
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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const email = localStorage.getItem("auth_email");
      
      if (token && email && email !== "null" && email !== "undefined") {
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