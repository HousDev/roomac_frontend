


// context/authContext.tsx
"use client";

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  loginSource: "admin" | "tenant"; // ✅ NEW
};

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  setUser:any;
  login: (
    email: string,
    role: "admin" | "tenant",
    token: string,
    loginSource: "admin" | "tenant" // ✅ NEW
  ) => void;
  logout: () => void;
    can: (permission: string) => boolean;  // ← ADD THIS

};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchUser = async () => {try{
const user = await axios.get(import.meta.env.VITE_API_URL+"/api/auth/get-user-details/"+localStorage.getItem('auth_email'))
console.log(user.data.user)
   const userData = user.data.user;
   userData.name = userData.name.split(" ").map((n:string) => n.charAt(0).toUpperCase()+n.slice(1)).join(" ")
    setUser(userData)
}catch(error){
  console.log(error)
}
  }
  const login = (
    email: string,
    role: string ,
    token: string,
    loginSource: "admin" | "tenant"
  ) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_email", email);
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_login_source", loginSource); // ✅ NEW

    fetchUser();
    setLoading(false)
  };

  const logout = () => {
    const loginSource = localStorage.getItem("auth_login_source");

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_login_source");
    localStorage.clear()
    setUser(null);

    
   


    window.location.href = "/login";

    
  };

 useEffect(() => {
  const token = localStorage.getItem("auth_token");
  const email = localStorage.getItem("auth_email");
  const role = localStorage.getItem("auth_role") as "admin" | "tenant";
  const loginSource = localStorage.getItem("auth_login_source") as "admin" | "tenant";

  if (token && email && role && loginSource) {
    fetchUser().finally(() => setLoading(false)); // ← CHANGE THIS
  } else {
    setLoading(false); // ← AND THIS for when no token
  }
}, []);

// const can = (permission: string): boolean => {
//   // admin role ko sab kuch allow
//   const role =
//     (user as any)?.role_name ??
//     (user as any)?.role ??
//     null;
//   if (role === "admin") return true;
 
//   // user ki permissions check karo (users table se aayi hain)
//   const perms: Record<string, boolean> | null =
//     (user as any)?.permissions ?? null;
//   if (perms && typeof perms === "object") return Boolean(perms[permission]);
 
//   return false;
// };

const can = (permission: string): boolean => {
  if (!user) return false;

  const role = user?.role_name ?? user?.role ?? null;
  if (role === "admin" || role === "Admin") return true;

  const hasCustom = user?.has_custom_permissions;

  if (hasCustom) {
    // ── User has custom overrides: MERGE role + user ──
    const rolePerms: Record<string, boolean> = user?.role_permissions ?? {};
    const userPerms: Record<string, boolean> = user?.permissions ?? {};
    
    // User override wins, role is the base
    const merged = { ...rolePerms, ...userPerms };
    return Boolean(merged[permission]);
  } else {
    // ── No custom overrides: just use role permissions ──
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
              can,   // ← ADD THIS

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
