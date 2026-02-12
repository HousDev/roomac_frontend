import { useState, useEffect } from "react";
import { listProperties } from "@/lib/propertyApi";
import LoginClient from "@/components/tenant/login/LoginClient";
import LoadingSkeleton from "@/components/tenant/login/loading-skeleton";

export default function TenantLoginPage() {
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyImages().then(setPropertyImages).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  return <LoginClient initialPropertyImages={propertyImages} />;
}

async function fetchPropertyImages() {
  try {
    const res = await listProperties({ page: 1, pageSize: 4, is_active: true });

    if (res.success && res.data?.data?.length) {
      const images: string[] = res.data.data
        .map((p: any) => p.photo_urls?.[0])
        .filter(Boolean);

      while (images.length < 4) {
        images.push("https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+Image");
      }

      return images.slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch property images:", error);
  }

  // Return default images on error
  return [
    "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+1",
    "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Default+2",
    "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Default+3",
    "https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Default+4",
  ];
}