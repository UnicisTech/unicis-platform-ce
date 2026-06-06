import { Badge } from '@/components/shadcn/ui/badge';

const priorityColorMap: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const PriorityBadge = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  const normalized = value?.toLowerCase() ?? '';
  const className =
    priorityColorMap[normalized] || 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={`${className} whitespace-nowrap`}>
      {label}
    </Badge>
  );
};

export default PriorityBadge;
