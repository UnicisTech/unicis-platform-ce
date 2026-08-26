import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import type { User } from '@/generated/client';
import { validateFleetSqlQuery } from '@/lib/fleet/sqlValidation';
import { useCreateDistributors } from '@/hooks/fleets/distributors/useCreateDistributor';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Calendar } from '@/components/shadcn/ui/calendar';
import NodesSelector from '../AssetsSelector';
import TagsSelector from '../TagsSelector';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/shadcn/ui/popover';
import { CalendarIcon } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type DistributorFormErrors = Partial<Record<'sql' | 'nodes', string>>;

const CreateDistributors = ({
  visible,
  setVisible,
  user: _user,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const sqlInputRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<DistributorFormErrors>({});
  const [notBeforeDate, setNotBeforeDate] = useState<Date | undefined>(
    new Date()
  );
  const { t } = useTranslation(['common', 'fleet']);
  const createDistributor = useCreateDistributors();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const handleNodeSelection = (nodeKeys: string[]) => {
    setSelectedNodes(nodeKeys);
    setFormErrors((prev) => ({ ...prev, nodes: undefined }));
  };

  const handleTagSelection = (tagValues: string[]) => {
    setSelectedTags(tagValues);
    setFormErrors((prev) => ({ ...prev, nodes: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const description = formData.get('description') as string;
    const sql = formData.get('sql') as string;
    const sqlValidation = validateFleetSqlQuery(sql || '');
    const nextErrors: DistributorFormErrors = {};

    if (!sqlValidation.valid) {
      nextErrors.sql = t(sqlValidation.messageKey);
    }

    if (selectedNodes.length === 0 && selectedTags.length === 0) {
      nextErrors.nodes = t('select-assets-required');
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);

      if (nextErrors.sql) {
        sqlInputRef.current?.focus();
      }

      return;
    }

    setFormErrors({});

    const queryData = {
      description,
      sql,
      tags: selectedTags,
      nodes: selectedNodes,
      not_before: notBeforeDate?.toISOString(),
    };

    try {
      await createDistributor(fleetTeamId, queryData);
      toast.success(t('success'));
      mutateDistributorsTasks();
      setVisible(false);
    } catch (error: any) {
      toast.error(error?.message || t('error'));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl w-[min(95vw,56rem)] max-h-[90vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('create-script')}</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 min-w-0"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="sql">{t('sql-code')}</Label>
            <Input
              ref={sqlInputRef}
              id="sql"
              name="sql"
              placeholder={t('enter-sql-code')}
              aria-invalid={!!formErrors.sql}
              onChange={() =>
                setFormErrors((prev) => ({ ...prev, sql: undefined }))
              }
            />
            {formErrors.sql && (
              <p className="text-sm text-destructive">{formErrors.sql}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('assign-assets')}</Label>
            <NodesSelector
              fleetTeamId={fleetTeamId}
              setSectionNode={setSelectedNodes}
              onSelect={handleNodeSelection}
            />
            {formErrors.nodes && (
              <p className="text-sm text-destructive">{formErrors.nodes}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <ReactQuill theme="snow" id="description" />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>{t('not-before')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full max-w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {notBeforeDate
                    ? notBeforeDate.toLocaleString()
                    : t('pick-a-date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={notBeforeDate}
                  onSelect={setNotBeforeDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('tags')}</Label>
            <TagsSelector
              fleetTeamId={fleetTeamId}
              setSectionTag={setSelectedTags}
              onSelect={handleTagSelection}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button type="submit" ref={submitButtonRef}>
              {t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDistributors;
