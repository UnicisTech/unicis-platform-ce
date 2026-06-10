import { Badge } from '@/components/shadcn/ui/badge';

const priorityColorMap: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
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
    priorityColorMap[normalized] ||
    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

  return (
    <Badge variant="outline" className={`${className} whitespace-nowrap`}>
      {label}
    </Badge>
  );
};

export default PriorityBadge;
