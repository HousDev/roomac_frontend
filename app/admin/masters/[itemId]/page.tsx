
// app/admin/masters/[itemId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getMasterItems, getMasterValues } from "@/lib/masterApi";
import ValuesClient from "@/components/admin/masters/[itemId]/ValuesClient";
import Loading from "@/components/admin/masters/[itemId]/loading";
import ErrorComponent from "@/components/admin/masters/[itemId]/error";

export default function MasterValuesPage() {
  const params = useParams();
  const itemId = params?.itemId as string;
  
  const [masterItem, setMasterItem] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) {
      setError(new Error("Item ID is required"));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        
        // Get all items and find the one we need
        const itemsRes = await getMasterItems();
        
        if (!itemsRes?.success) {
          throw new Error("Failed to fetch master items");
        }

        const item = itemsRes.data.find((i: any) => i.id === parseInt(itemId));
        
        if (!item) {
          throw new Error("Master item not found");
        }

        setMasterItem(item);

        // Get values for this item
        const valuesRes = await getMasterValues(parseInt(itemId));
        
        setInitialValues(valuesRes?.success && Array.isArray(valuesRes.data) ? valuesRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  if (loading) return <Loading />;
  if (error) return <ErrorComponent error={error} />;
  if (!masterItem) return <ErrorComponent error={new Error("Master item not found")} />;
  
  return <ValuesClient masterItem={masterItem} initialValues={initialValues} />;
}