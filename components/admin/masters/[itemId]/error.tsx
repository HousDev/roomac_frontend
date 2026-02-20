// components/admin/masters/[itemId]/error.tsx
"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorComponentProps {
  error: Error;
}

export default function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Values</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={() => router.push("/admin/masters")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Back to Masters
        </button>
      </div>
    </div>
  );
}