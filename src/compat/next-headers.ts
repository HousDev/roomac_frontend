function cookieStore() {
  return {
    get: (name: string) => {
      if (typeof document === 'undefined') return undefined;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? { value: match[2] } : undefined;
    },
    getAll: () => [],
    set: () => {},
    delete: () => {},
    has: () => false,
  };
}

export function cookies(): ReturnType<typeof cookieStore> {
  return cookieStore();
}
