export type Metadata = { title?: string; description?: string; [key: string]: unknown };

export function notFound() {
  window.location.href = '/404';
}
