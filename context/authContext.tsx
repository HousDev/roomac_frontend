// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api";

type User = {
    id?: number;
    email: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // helper to set user state
    const setUser = (u: User | null) => {
        setUserState(u);
    };

    // login: persist token & user info and update state
    const login = (email: string, token: string) => {
        try {
            // Save token using helper from lib/api (keeps single source)
            setAuthToken(token);
            if (typeof window !== "undefined") {
                localStorage.setItem("admin_email", email);
                localStorage.setItem("admin_logged_in", "true");
            }
            setUser({ email });
        } catch (err) {
            console.error("AuthContext.login error:", err);
        }
    };

    // logout: clear storage and state
    const logout = () => {
        try {
            clearAuthToken();
            if (typeof window !== "undefined") {
                localStorage.removeItem("admin_email");
                localStorage.removeItem("admin_logged_in");
            }
            setUser(null);
            // redirect to login page
            if (typeof window !== "undefined") {
                window.location.href = "/admin/login";
            }
        } catch (err) {
            console.error("AuthContext.logout error:", err);
        }
    };

    // on mount: restore user from localStorage token/email
    useEffect(() => {
        (async () => {
            try {
                const token = getAuthToken();
                const email = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null;

                if (token && email) {
                    // If you have an endpoint /api/auth/me to validate token and fetch user details,
                    // you can uncomment and use it here to fetch fresh user info.
                    //
                    // try {
                    //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    //     headers: { Authorization: `Bearer ${token}` },
                    //   });
                    //   if (res.ok) {
                    //     const data = await res.json();
                    //     setUser(data.user); // adapt according to your /me response
                    //   } else {
                    //     // invalid token => clear
                    //     clearAuthToken();
                    //     setUser(null);
                    //   }
                    // } catch (e) {
                    //   console.warn("Failed to validate token:", e);
                    //   clearAuthToken();
                    //   setUser(null);
                    // }

                    // Minimal approach: trust token and restore email
                    setUser({ email });
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("AuthProvider init error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
