import { PropStatus } from '@/types/props';
import { Badge } from '@/components/ui/badge';

const CONFIG: Record<PropStatus, { label: string; className: string }> = {
  not_searched: { label: 'Not searched', className: 'bg-muted text-muted-foreground' },
  searching: { label: 'Searching…', className: 'bg-primary/20 text-primary animate-pulse' },
  options_found: { label: 'Options found', className: 'bg-success/20 text-success' },
  no_results: { label: 'No results', className: 'bg-destructive/20 text-destructive' },
};

export function StatusBadge({ status }: { status: PropStatus }) {
  const { label, className } = CONFIG[status];
  return <Badge variant="secondary" className={className}>{label}</Badge>;
}
