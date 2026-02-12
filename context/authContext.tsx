"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api";

type User = {
    email: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = (email: string, token: string) => {
        setAuthToken(token);
        localStorage.setItem("admin_email", email);
        setUser({ email });
    };

    const logout = () => {
        clearAuthToken();
        localStorage.removeItem("admin_email");
        setUser(null);
    };

    useEffect(() => {
        const token = getAuthToken();
        const email = localStorage.getItem("admin_email");

        if (token && email) {
            setUser({ email });
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
