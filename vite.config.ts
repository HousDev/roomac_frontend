import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'next/headers': path.resolve(__dirname, 'src/compat/next-headers.ts'),
      'next/router': path.resolve(__dirname, 'src/compat/next-router.ts'),
      'next/link': path.resolve(__dirname, 'src/compat/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, 'src/compat/next-navigation.tsx'),
      'next/image': path.resolve(__dirname, 'src/compat/next-image.tsx'),
      'next/font/google': path.resolve(__dirname, 'src/compat/next-font.tsx'),
      'next': path.resolve(__dirname, 'src/compat/next.ts'),
    },
  },
  define: {
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
