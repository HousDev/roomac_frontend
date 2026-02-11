import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // 🔥 Proper way to read env in vite config
  const env = loadEnv(mode, process.cwd(), "");

  const API_URL = env.VITE_API_URL || "http://localhost:3001";

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        "next/headers": path.resolve(__dirname, "src/compat/next-headers.ts"),
        "next/router": path.resolve(__dirname, "src/compat/next-router.ts"),
        "next/link": path.resolve(__dirname, "src/compat/next-link.tsx"),
        "next/navigation": path.resolve(__dirname, "src/compat/next-navigation.tsx"),
        "next/image": path.resolve(__dirname, "src/compat/next-image.tsx"),
        "next/font/google": path.resolve(__dirname, "src/compat/next-font.tsx"),
        "next": path.resolve(__dirname, "src/compat/next.ts"),
      },
    },

    // ❌ DO NOT USE import.meta.env here
    define: {
      "process.env.VITE_API_URL": JSON.stringify(API_URL),
    },

    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
        },
        "/uploads": {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});



// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, '.'),
//       'next/headers': path.resolve(__dirname, 'src/compat/next-headers.ts'),
//       'next/router': path.resolve(__dirname, 'src/compat/next-router.ts'),
//       'next/link': path.resolve(__dirname, 'src/compat/next-link.tsx'),
//       'next/navigation': path.resolve(__dirname, 'src/compat/next-navigation.tsx'),
//       'next/image': path.resolve(__dirname, 'src/compat/next-image.tsx'),
//       'next/font/google': path.resolve(__dirname, 'src/compat/next-font.tsx'),
//       'next': path.resolve(__dirname, 'src/compat/next.ts'),
//     },
//   },
//   define: {
//     'process.env.VITE_API_URL': JSON.stringify(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001'),
//   },
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: import.meta.env.VITE_API_URL || 'http://localhost:3001',
//         changeOrigin: true,
//       },
//       '/uploads': {
//         target: import.meta.env.VITE_API_URL || 'http://localhost:3001',
//         changeOrigin: true,
//       },
//     },
//   },
// });
