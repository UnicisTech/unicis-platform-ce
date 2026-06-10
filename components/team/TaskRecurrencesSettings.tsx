import { useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Archive, Loader2, Pause, Pencil, Play, Plus } from 'lucide-react';
import { defaultHeaders } from '@/lib/common';
import { DEFAULT_TASK_PRIORITY, statuses, taskPriorities } from '@/lib/tasks';
import type { TaskPriority } from '@/lib/tasks';
import {
  getTaskRecurrencePresetForRule,
  isTaskRecurrenceEditableStatus,
  recurrencePresetRules,
  taskRecurrencePresets,
  taskRecurrenceUnits,
  type TaskRecurrenceEditableStatus,
  type TaskRecurrencePreset,
} from '@/lib/tasks/recurrence';
import {
  PriorityBadge,
  StatusBadge,
  WithLoadingAndError,
} from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import QuillEditor from '@/components/shared/QuillEditor';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { DateTimePickerInput } from '@/components/shadcn/ui/date-time-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import useCanAccess from 'hooks/useCanAccess';
import useTaskRecurrences from 'hooks/useTaskRecurrences';
import type {
  TaskRecurrenceStatus,
  TaskRecurrenceUnit,
} from '@/generated/enums';
import type { ApiResponse, TaskRecurrence, Team } from 'types';

type FormValues = {
  title: string;
  description: string;
  taskStatus: string;
  priority: TaskPriority;
  preset: TaskRecurrencePreset;
  unit: TaskRecurrenceUnit;
  interval: string;
  startAt: string;
  timezone: string;
  status: TaskRecurrenceEditableStatus;
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

const toDateTimeInputValue = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return (
    [
      date.getFullYear(),
      padDatePart(date.getMonth() + 1),
      padDatePart(date.getDate()),
    ].join('-') +
    `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
  );
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getDefaultTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const getInitialFormValues = (
  recurrence?: TaskRecurrence | null
): FormValues => {
  if (!recurrence) {
    return {
      title: '',
      description: '',
      taskStatus: 'todo',
      priority: DEFAULT_TASK_PRIORITY,
      preset: 'monthly',
      unit: recurrencePresetRules.monthly.unit,
      interval: String(recurrencePresetRules.monthly.interval),
      startAt: toDateTimeInputValue(new Date()),
      timezone: getDefaultTimezone(),
      status: 'ACTIVE',
    };
  }

  return {
    title: recurrence.title,
    description: recurrence.description ?? '',
    taskStatus: recurrence.taskStatus,
    priority: (recurrence.priority ?? DEFAULT_TASK_PRIORITY) as TaskPriority,
    preset: getTaskRecurrencePresetForRule({
      unit: recurrence.unit,
      interval: recurrence.interval,
    }),
    unit: recurrence.unit,
    interval: String(recurrence.interval),
    startAt: toDateTimeInputValue(recurrence.startAt),
    timezone: recurrence.timezone || 'UTC',
    status: isTaskRecurrenceEditableStatus(recurrence.status)
      ? recurrence.status
      : 'PAUSED',
  };
};

const recurrenceStatusClassName: Record<TaskRecurrenceStatus, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PAUSED:
    'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200',
  ARCHIVED:
    'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

const TaskRecurrencesSettings = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const { isLoading, isError, taskRecurrences, mutateTaskRecurrences } =
    useTaskRecurrences(team.slug);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] =
    useState<TaskRecurrence | null>(null);
  const [selectedRecurrence, setSelectedRecurrence] =
    useState<TaskRecurrence | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(
    getInitialFormValues()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const canCreate = canAccess('task', ['create']);
  const canUpdate = canAccess('task', ['update']);
  const canDelete = canAccess('task', ['delete']);
  const showActions = canUpdate || canDelete;

  const sortedRecurrences = useMemo(
    () => taskRecurrences ?? [],
    [taskRecurrences]
  );

  const setFormValue = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditingRecurrence(null);
    setFormValues(getInitialFormValues());
    setDialogOpen(true);
  };

  const openEditDialog = (recurrence: TaskRecurrence) => {
    setEditingRecurrence(recurrence);
    setFormValues(getInitialFormValues(recurrence));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecurrence(null);
    setFormValues(getInitialFormValues());
  };

  const handlePresetChange = (preset: TaskRecurrencePreset) => {
    const rule = preset === 'custom' ? null : recurrencePresetRules[preset];

    setFormValues((current) => ({
      ...current,
      preset,
      ...(rule
        ? {
            unit: rule.unit,
            interval: String(rule.interval),
          }
        : {}),
    }));
  };

  const buildPayload = () => {
    const rule =
      formValues.preset === 'custom'
        ? null
        : recurrencePresetRules[formValues.preset];
    const interval = rule?.interval ?? Number(formValues.interval);
    const unit = rule?.unit ?? formValues.unit;
    const startAt = new Date(formValues.startAt);

    if (!formValues.title.trim()) {
      toast.error(t('recurrence-title-required'));
      return null;
    }

    if (Number.isNaN(startAt.getTime())) {
      toast.error(t('recurrence-start-required'));
      return null;
    }

    if (!Number.isInteger(interval) || interval < 1) {
      toast.error(t('recurrence-interval-invalid'));
      return null;
    }

    if (!formValues.timezone.trim()) {
      toast.error(t('timezone-required'));
      return null;
    }

    return {
      title: formValues.title.trim(),
      description: formValues.description,
      taskStatus: formValues.taskStatus,
      priority: formValues.priority,
      unit,
      interval,
      startAt: startAt.toISOString(),
      timezone: formValues.timezone.trim(),
      status: formValues.status,
    };
  };

  const submitRecurrence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingRecurrence
        ? `/api/teams/${team.slug}/task-recurrences/${editingRecurrence.id}`
        : `/api/teams/${team.slug}/task-recurrences`;
      const res = await fetch(url, {
        method: editingRecurrence ? 'PUT' : 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiResponse<TaskRecurrence>;

      if (!res.ok || json.error) {
        toast.error(json.error?.message || t('errors.requestFailed'));
        return;
      }

      await mutateTaskRecurrences();
      toast.success(
        editingRecurrence ? t('recurrence-updated') : t('recurrence-created')
      );
      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || t('errors.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRecurrenceStatus = async (
    recurrence: TaskRecurrence,
    status: TaskRecurrenceEditableStatus
  ) => {
    setActionId(`${recurrence.id}-${status}`);

    try {
      const res = await fetch(
        `/api/teams/${team.slug}/task-recurrences/${recurrence.id}`,
        {
          method: 'PUT',
          headers: defaultHeaders,
          body: JSON.stringify({ status }),
        }
      );
      const json = (await res.json()) as ApiResponse<TaskRecurrence>;

      if (!res.ok || json.error) {
        toast.error(json.error?.message || t('errors.requestFailed'));
        return;
      }

      await mutateTaskRecurrences();
      toast.success(
        status === 'ACTIVE' ? t('recurrence-resumed') : t('recurrence-paused')
      );
    } catch (error: any) {
      toast.error(error?.message || t('errors.unexpectedError'));
    } finally {
      setActionId(null);
    }
  };

  const archiveRecurrence = async () => {
    if (!selectedRecurrence) {
      return;
    }

    setActionId(`${selectedRecurrence.id}-archive`);

    try {
      const res = await fetch(
        `/api/teams/${team.slug}/task-recurrences/${selectedRecurrence.id}`,
        {
          method: 'DELETE',
          headers: defaultHeaders,
        }
      );
      const json = (await res.json()) as ApiResponse<TaskRecurrence>;

      if (!res.ok || json.error) {
        toast.error(json.error?.message || t('errors.requestFailed'));
        return;
      }

      await mutateTaskRecurrences();
      toast.success(t('recurrence-archived'));
      setSelectedRecurrence(null);
    } catch (error: any) {
      toast.error(error?.message || t('errors.unexpectedError'));
    } finally {
      setActionId(null);
    }
  };

  const getPresetLabel = (preset: TaskRecurrencePreset) =>
    t(`recurrence-presets.${preset}`);

  const getUnitLabel = (unit: TaskRecurrenceUnit, count: number) =>
    t(`recurrence-units.${unit}${count === 1 ? '' : '_plural'}`);

  const getRecurrenceSummary = (recurrence: TaskRecurrence) => {
    const preset = getTaskRecurrencePresetForRule({
      unit: recurrence.unit,
      interval: recurrence.interval,
    });

    if (preset !== 'custom') {
      return getPresetLabel(preset);
    }

    return t('recurrence-custom-summary', {
      interval: recurrence.interval,
      unit: getUnitLabel(recurrence.unit, recurrence.interval),
    });
  };

  const isCustom = formValues.preset === 'custom';
  const intervalValue = Number(formValues.interval);
  const isSaveDisabled =
    isSubmitting ||
    !formValues.title.trim() ||
    !formValues.startAt ||
    !formValues.timezone.trim() ||
    (isCustom && (!Number.isInteger(intervalValue) || intervalValue < 1));

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <div>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {t('recurring-tasks')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('recurring-tasks-description')}
            </p>
          </div>
          {canCreate && (
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              {t('create-recurring-task')}
            </Button>
          )}
        </div>

        <div className="p-4">
          <WithLoadingAndError isLoading={isLoading} error={isError}>
            {sortedRecurrences.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('no-recurring-tasks')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('title')}</TableHead>
                    <TableHead>{t('recurrence')}</TableHead>
                    <TableHead>{t('generated-task')}</TableHead>
                    <TableHead>{t('next-run-at')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    {showActions && (
                      <TableHead className="text-right">
                        {t('actions')}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecurrences.map((recurrence) => (
                    <TableRow key={recurrence.id}>
                      <TableCell className="min-w-[180px] font-medium">
                        {recurrence.title}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getRecurrenceSummary(recurrence)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge
                            value={recurrence.taskStatus}
                            label={t(`task-statuses.${recurrence.taskStatus}`)}
                          />
                          <PriorityBadge
                            value={recurrence.priority}
                            label={t(`task-priorities.${recurrence.priority}`)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[170px]">
                        <div>{formatDateTime(recurrence.nextRunAt)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {recurrence.timezone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            recurrenceStatusClassName[recurrence.status]
                          }
                        >
                          {t(`task-recurrence-statuses.${recurrence.status}`)}
                        </Badge>
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  title={t('edit')}
                                  aria-label={t('edit')}
                                  onClick={() => openEditDialog(recurrence)}
                                >
                                  <Pencil />
                                </Button>
                                {recurrence.status === 'ACTIVE' ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title={t('pause')}
                                    aria-label={t('pause')}
                                    disabled={
                                      actionId === `${recurrence.id}-PAUSED`
                                    }
                                    onClick={() =>
                                      updateRecurrenceStatus(
                                        recurrence,
                                        'PAUSED'
                                      )
                                    }
                                  >
                                    {actionId === `${recurrence.id}-PAUSED` ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <Pause />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title={t('resume')}
                                    aria-label={t('resume')}
                                    disabled={
                                      actionId === `${recurrence.id}-ACTIVE`
                                    }
                                    onClick={() =>
                                      updateRecurrenceStatus(
                                        recurrence,
                                        'ACTIVE'
                                      )
                                    }
                                  >
                                    {actionId === `${recurrence.id}-ACTIVE` ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <Play />
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
                            {canDelete && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                title={t('archive')}
                                aria-label={t('archive')}
                                disabled={
                                  actionId === `${recurrence.id}-archive`
                                }
                                onClick={() => {
                                  setSelectedRecurrence(recurrence);
                                  setArchiveDialogOpen(true);
                                }}
                              >
                                <Archive />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </WithLoadingAndError>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            return;
          }

          setDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-visible p-0">
          <DialogHeader>
            <div className="p-6 pb-0">
              <DialogTitle>
                {editingRecurrence
                  ? t('edit-recurring-task')
                  : t('create-recurring-task')}
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {t('recurring-task-dialog-description')}
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={submitRecurrence}>
            <div className="max-h-[calc(90vh-9rem)] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-2">
                <Label htmlFor="recurrence-title">{t('title')}</Label>
                <Input
                  id="recurrence-title"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValue('title', event.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="recurrence-task-status">
                    {t('generated-task-status')}
                  </Label>
                  <Select
                    value={formValues.taskStatus}
                    onValueChange={(value) => setFormValue('taskStatus', value)}
                  >
                    <SelectTrigger id="recurrence-task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`task-statuses.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recurrence-priority">{t('priority')}</Label>
                  <Select
                    value={formValues.priority}
                    onValueChange={(value) =>
                      setFormValue('priority', value as TaskPriority)
                    }
                  >
                    <SelectTrigger id="recurrence-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`task-priorities.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="recurrence-preset">{t('preset')}</Label>
                  <Select
                    value={formValues.preset}
                    onValueChange={(value) =>
                      handlePresetChange(value as TaskRecurrencePreset)
                    }
                  >
                    <SelectTrigger id="recurrence-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskRecurrencePresets.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {getPresetLabel(preset)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recurrence-start-at">{t('starts-at')}</Label>
                  <DateTimePickerInput
                    id="recurrence-start-at"
                    value={formValues.startAt}
                    onChange={(value) => setFormValue('startAt', value)}
                    placeholder={t('pick-a-date-time')}
                    timeLabel={t('time')}
                    popoverClassName="pointer-events-auto z-60"
                  />
                </div>
              </div>

              {isCustom && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="recurrence-interval">{t('interval')}</Label>
                    <Input
                      id="recurrence-interval"
                      type="number"
                      min={1}
                      step={1}
                      value={formValues.interval}
                      onChange={(event) =>
                        setFormValue('interval', event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="recurrence-unit">{t('unit')}</Label>
                    <Select
                      value={formValues.unit}
                      onValueChange={(value) =>
                        setFormValue('unit', value as TaskRecurrenceUnit)
                      }
                    >
                      <SelectTrigger id="recurrence-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskRecurrenceUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {t(`recurrence-unit-options.${unit}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label>{t('description')}</Label>
                <QuillEditor
                  theme="snow"
                  value={formValues.description}
                  onChange={(value) => setFormValue('description', value)}
                />
              </div>
            </div>

            <DialogFooter className="border-t bg-white dark:bg-slate-800 px-6 py-4">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSaveDisabled}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {editingRecurrence ? t('save-changes') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        visible={archiveDialogOpen}
        title={t('confirm-archive-recurrence')}
        confirmText={t('archive')}
        onCancel={() => {
          setArchiveDialogOpen(false);
          setSelectedRecurrence(null);
        }}
        onConfirm={archiveRecurrence}
      >
        {t('archive-recurrence-warning')}
      </ConfirmationDialog>
    </>
  );
};

export default TaskRecurrencesSettings;
