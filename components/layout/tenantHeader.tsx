"use client";

import { Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const TenantHeader = () => {
  const router = useRouter();

  const [tenant, setTenant] = useState<{
    full_name?: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    const tenantData = localStorage.getItem("tenant_data");

    if (tenantData) {
      setTenant(JSON.parse(tenantData));
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("tenant_token");
    localStorage.removeItem("tenant_id"); 
    localStorage.removeItem("tenant_email");
    localStorage.removeItem("tenant_data");
localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_email");
        localStorage.removeItem("auth_role");
       
    router.push("/login");
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          <Home className="h-7 w-7 text-blue-600" />

          <div>
            <h1 className="text-xl font-bold">Tenant Portal</h1>
            <p className="text-xs text-slate-600">Welcome back!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {tenant?.full_name || tenant?.name || "-"}
          </span>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

      </div>
    </header>
  );
};

export default TenantHeader;
