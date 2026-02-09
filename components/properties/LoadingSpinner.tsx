"use client";

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      {text && <p className="text-sm md:text-lg font-semibold text-gray-700">{text}</p>}
    </div>
  );
}