const router = {
  push: (url: string) => { window.location.href = url; },
  replace: (url: string) => { window.location.replace(url); },
  back: () => { window.history.back(); },
  forward: () => { window.history.forward(); },
  prefetch: () => {},
  pathname: typeof window !== 'undefined' ? window.location.pathname : '',
  query: typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {},
  asPath: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
  events: { on: () => {}, off: () => {}, emit: () => {} },
};
export default router;
