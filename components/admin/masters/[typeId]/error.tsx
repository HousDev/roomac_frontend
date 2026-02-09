"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error?: Error;
}

export default function Error({ error }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 text-center mb-6">
          {error?.message || "Failed to load master values"}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/admin/masters")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Masters
          </button>
        </div>
      </div>
    </div>
  );
}