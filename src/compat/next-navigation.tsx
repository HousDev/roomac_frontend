import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

export function usePathname() {
  return useLocation().pathname;
}

export interface AppRouterInstance {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  prefetch: () => void;
  refresh: () => void;
}

export function useRouter(): AppRouterInstance {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    prefetch: () => {},
    refresh: () => window.location.reload(),
  };
}

export { useParams, useSearchParams };

export function redirect(url: string) {
  window.location.href = url;
}

export function notFound() {
  window.location.href = '/404';
}
