import { Badge } from '@/components/shadcn/ui/badge';

const statusColorMap: Record<string, string> = {
  todo: 'bg-task-todo text-black',
  inprogress: 'bg-task-inprogress text-white',
  inreview: 'bg-task-inreview text-white',
  feedback: 'bg-task-feedback text-white',
  done: 'bg-task-done text-white',
  failed: 'bg-task-failed text-white',
};

const StatusBadge = ({ label, value }: { label: string; value: string }) => {
  const normalized = value.toLowerCase();
  const className = statusColorMap[normalized] || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200';

  return (
    <Badge variant="outline" className={`${className} whitespace-nowrap`}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
