/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "next/font/google" {
  export function Poppins(config: {
    weight?: string[];
    subsets?: string[];
    display?: string;
  }): { className: string };
}

declare module "next/navigation" {
  export function usePathname(): string | null;
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    prefetch: () => void;
    refresh: () => void;
  };
  export function useParams<T = Record<string, string>>(): T;
  export function useSearchParams(): URLSearchParams;
  export function redirect(url: string): never;
  export function notFound(): never;
}
