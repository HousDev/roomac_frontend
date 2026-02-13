"use client";

import "./globals.css";
import { Poppins } from "@/src/compat/next-font";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { usePathname } from "@/src/compat/next-navigation";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";


const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isTenantRoute = pathname?.includes("/tenant");

  return (
    <div>
      <div className={poppins.className}>
        {!isAdminRoute && !isTenantRoute && <Header />}
        <main className="min-h-screen"><Outlet /></main>
        {!isAdminRoute && !isTenantRoute && <Footer />}
      </div>
    </div>
  );
}
