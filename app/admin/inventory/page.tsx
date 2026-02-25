// app/admin/inventory/page.tsx

import { Package } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      
      <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, #1B4FD8, #0A1F5C)" }}>
        <Package className="h-10 w-10 text-white" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
        style={{ background: "rgba(245,192,0,0.15)", color: "#b8860b", border: "1px solid rgba(245,192,0,0.4)" }}>
        Coming Soon
      </span>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        Inventory Management
      </h1>

      <p className="text-gray-400 max-w-md text-sm">
        We're working on a powerful inventory system to help you track assets and manage stock across all your properties.
      </p>

    </div>
  );
}