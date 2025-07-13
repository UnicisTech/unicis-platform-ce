'use client';

import React, {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useMemo,
  useEffect,
} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
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
  controlHanlder,
  isSaving,
  isDeleting,
  deleteControlHandler,
  setStatuses,
}: {
  ISO: string;
  status: string;
  control: string;
  controls: string[];
  controlHanlder: (oldControl: string, newControl: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  deleteControlHandler: (control: string) => void;
  setStatuses: Dispatch<
    SetStateAction<
      | {
          [key: string]: string;
        }
      | undefined
    >
  >;
}) => {
  const router = useRouter();
  const { slug } = router.query;
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const controlOptions = useMemo(() => getControlOptions(ISO), [ISO]);
  const availableOptions = controlOptions.filter(
    (option) => !controls.includes(option.value.control)
  );

  const controlData = controlOptions.find(
    ({ value }) => value.control === control
  )?.value;

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      const response = await axios.put(`/api/teams/${slug}/csc`, {
        control,
        value,
      });

      const { data, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Status changed!');
      setStatuses(data.statuses);
    },
    [slug, setStatuses]
  );

  useEffect(() => {
    console.log('availableOptions', availableOptions);
    console.log('controlOptions', controlOptions);
  }, [availableOptions, controlOptions]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Select a control</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Select
            value={control}
            onValueChange={(newVal) => controlHanlder(control, newVal)}
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
              await deleteControlHandler(control);
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
          handler={statusHandler}
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
