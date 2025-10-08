import { eventTypes } from '@/lib/common';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Label } from '@/components/shadcn/ui/label';
import type { WebookFormSchema } from 'types';

interface Props {
  values: WebookFormSchema['eventTypes'];
  error?: string | string[];
  setFieldValue: (field: string, value: any) => void;
}

const EventTypes = ({ values, error, setFieldValue }: Props) => {
  const handleChange = (eventType: string, checked: boolean) => {
    const updated = checked
      ? [...values, eventType]
      : values.filter((val) => val !== eventType);

    setFieldValue('eventTypes', updated);
  };

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {eventTypes.map((eventType) => (
        <div key={eventType} className="flex items-center space-x-2">
          <Checkbox
            id={eventType}
            checked={values.includes(eventType)}
            onCheckedChange={(checked) =>
              handleChange(eventType, checked as boolean)
            }
          />
          <Label htmlFor={eventType} className="text-sm">
            {eventType}
          </Label>
        </div>
      ))}
      {error && typeof error === 'string' && (
        <div className="col-span-2 text-sm text-destructive mt-1">{error}</div>
      )}
    </div>
  );
};

export default EventTypes;
