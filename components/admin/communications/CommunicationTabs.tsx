"use client";

import { useRouter, usePathname } from "next/navigation";

export function CommunicationTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: " Email History", path: "/admin/communications/email-history" },
    { name: " WhatsApp History", path: "/admin/communications/whatsapp-history" },
    { name: " SMS History", path: "/admin/communications/sms-history" },
  ];

  return (
    <div className="flex gap-1 bg-white rounded-lg border border-[#E4E8F0] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => router.push(tab.path)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            pathname === tab.path
              ? "bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white shadow-sm"
              : "text-[#6B7A99] hover:bg-[#F2F4F8]"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}