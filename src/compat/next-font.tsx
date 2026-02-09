export function Poppins(config: { weight?: string[]; subsets?: string[]; display?: string }) {
  const weights = (config.weight || ['400', '600']).join(';');
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=Poppins:wght@${weights}&display=${config.display || 'swap'}`;
    if (!document.querySelector('link[href*="Poppins"]')) document.head.appendChild(link);
  }
  return { className: 'font-poppins' };
}
