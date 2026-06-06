import { useTranslation } from 'next-i18next';
import { Repeat2 } from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';

const TaskRecurrenceBadge = () => {
  const { t } = useTranslation('common');

  return (
    <Badge
      variant="outline"
      className="border-sky-200 bg-sky-50 text-sky-700 whitespace-nowrap"
    >
      <Repeat2 className="mr-1 h-3 w-3" />
      {t('recurring-task-badge')}
    </Badge>
  );
};

export default TaskRecurrenceBadge;
