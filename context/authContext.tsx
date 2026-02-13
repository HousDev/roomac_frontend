// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";

// type User = {
//     email: string;
// };

// type AuthContextType = {
//     user: User | null;
//     isAuthenticated: boolean;
//     login: (email: string, token: string) => void;
//     logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);

//     useEffect(() => {
//         const token = localStorage.getItem("auth_token");
//         const email = localStorage.getItem("auth_email");

//         if (token && email) {
//             setUser({ email });
//         }
//     }, []);

//     const login = (email: string, token: string) => {
//         localStorage.setItem("auth_token", token);
//         localStorage.setItem("auth_email", email);
//         setUser({ email });
//     };

//     const logout = () => {
//         localStorage.removeItem("auth_token");
//         localStorage.removeItem("auth_email");
//         setUser(null); // 🔥 MOST IMPORTANT
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 isAuthenticated: !!user,
//                 login,
//                 logout,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const ctx = useContext(AuthContext);
//     if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//     return ctx;
// }

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
    email: string;
    role: "admin" | "tenant";
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, role: "admin" | "tenant", token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = (email: string, role: "admin" | "tenant", token: string) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_email", email);
        localStorage.setItem("auth_role", role);
        setUser({ email, role });
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_email");
        localStorage.removeItem("auth_role");
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const email = localStorage.getItem("auth_email");
        const role = localStorage.getItem("auth_role") as "admin" | "tenant";

        if (token && email && role) {
            setUser({ email, role });
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
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
