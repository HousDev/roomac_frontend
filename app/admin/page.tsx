"use client";

import { useEffect } from 'react';
import { useRouter } from '@/src/compat/next-navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
        router.push('/tenant/login');
  }, [router]);

  return null;
}
