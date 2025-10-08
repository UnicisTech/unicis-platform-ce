import React, {
  useState,
  useMemo,
} from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import StatusSelector from '../StatusSelector';
import { Loader2, Trash2 } from 'lucide-react';
import { Label } from '@/components/shadcn/ui/label';

const ControlBlock = ({
  ISO,
  status,
  control,
  controls,
  isSaving,
  isDeleting,
  onControlChange,
  onStatusChange,
  onDeleteControl,
}: {
  ISO: string;
  status: string;
  control: string;
  controls: string[];
  isSaving: boolean;
  isDeleting: boolean;
  onStatusChange: (control: string, value: string) => Promise<string | undefined>;
  onControlChange: (oldControl: string, newControl: string) => void;
  onDeleteControl: (control: string) => void;
}) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const controlOptions = useMemo(() => getControlOptions(ISO), [ISO]);
  const availableOptions = controlOptions.filter(
    (option) => !controls.includes(option.value.control)
  );

  const controlData = controlOptions.find(
    ({ value }) => value.control === control
  )?.value;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Select a control</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Select
            value={control}
            onValueChange={(newVal) => onControlChange(control, newVal)}
            disabled={isSaving || isDeleting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a control">
                {
                  controlOptions.find(({ value }) => value.control === control)
                    ?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className="w-(--radix-select-trigger-width) max-w-full"
              align="start"
            >
              {availableOptions.map((option) => (
                <SelectItem
                  key={option.value.control}
                  value={option.value.control}
                  className="whitespace-normal break-words"
                >
                  <div className="text-sm font-medium leading-snug">
                    {option.value.code}: {option.value.section}
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    {option.value.controlLabel || option.value.control} –{' '}
                    {option.value.requirements}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            size="icon"
            disabled={isSaving}
            onClick={async () => {
              setIsButtonLoading(true);
              await onDeleteControl(control);
              setIsButtonLoading(false);
            }}
          >
            {isButtonLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {controlData?.code && (
        <div className="space-y-1">
          <Label>Code</Label>
          <Input value={controlData.code} readOnly />
        </div>
      )}

      {controlData?.section && (
        <div className="space-y-1">
          <Label>Section</Label>
          <Input value={controlData.section} readOnly />
        </div>
      )}

      <div className="space-y-1">
        <Label>Status</Label>
        <StatusSelector
          statusValue={status}
          control={control}
          handler={onStatusChange}
          isDisabled={false}
        />
      </div>

      {controlData?.requirements && (
        <div className="space-y-1">
          <Label>Requirements</Label>
          <Textarea
            value={controlData.requirements}
            readOnly
            className="resize-y max-h-[20vh]"
          />
        </div>
      )}

      <div className="h-px w-full bg-muted my-6" />
    </div>
  );
};

export default ControlBlock;
