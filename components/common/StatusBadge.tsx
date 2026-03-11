interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();

    if (['active', 'completed', 'confirmed', 'paid', 'available'].includes(statusLower)) {
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500'
      };
    }

    if (['pending', 'in progress', 'processing'].includes(statusLower)) {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500'
      };
    }

    if (['cancelled', 'rejected', 'failed', 'unavailable'].includes(statusLower)) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        dot: 'bg-red-500'
      };
    }

    if (['inactive', 'maintenance', 'draft'].includes(statusLower)) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        dot: 'bg-gray-500'
      };
    }

    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    };
  };

  const styles = getStatusStyles(status);

  if (variant === 'dot') {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
        <span className={`text-sm font-bold ${styles.text}`}>{status}</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border-2 ${styles.bg} ${styles.text} ${styles.border} shadow-sm`}>
      {status}
    </span>
  );
}
