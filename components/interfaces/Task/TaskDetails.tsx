import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/shadcn/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/shadcn/ui/popover';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { DEFAULT_TASK_PRIORITY, statuses, taskPriorities } from '@/lib/tasks';
import useTask from 'hooks/useTask';
import useCanAccess from 'hooks/useCanAccess';

import type { Task, Team } from 'types';
import QuillEditor from '@/components/shared/QuillEditor';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.string().min(1, 'Status is required'),
  priority: z.enum(taskPriorities),
  duedate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const TaskDetails = ({ task, team }: { task: Task; team: Team }) => {
  const router = useRouter();
  const { slug, taskNumber } = router.query;
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const { mutateTask } = useTask(slug as string, taskNumber as string);

  const [isFormChanged, setIsFormChanged] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title || '',
      status: task.status || '',
      priority: task.priority || DEFAULT_TASK_PRIORITY,
      duedate: task.duedate ? task.duedate.split('T')[0] : '',
      description: task.description || '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!isFormChanged) return;

    const res = await fetch(
      `/api/teams/${team.slug}/tasks/${task.taskNumber}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...data,
            teamId: team.id,
          },
        }),
      }
    );

    const { error } = await res.json();
    if (!res.ok || error) {
      toast.error(error?.message || t('errors.requestFailed'));
      return;
    }

    toast.success(t('task-updated'));
    setIsFormChanged(false);
    mutateTask();
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── Two-column layout ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4">

            {/* ── Left column: title + description ──────────────────── */}
            <div className="space-y-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {t('title')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onInput={checkFormChanges}
                        className="text-[15px] font-medium border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {t('description')}
                    </FormLabel>
                    <FormControl>
                      <QuillEditor
                        theme="snow"
                        value={field.value}
                        onChange={(val) => {
                          checkFormChanges();
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canAccess('task', ['update']) && (
                <div className="pt-2">
                  <Button type="submit" disabled={!isFormChanged || isSubmitting}>
                    {isSubmitting ? 'Saving...' : t('save-changes')}
                  </Button>
                </div>
              )}
            </div>

            {/* ── Right sidebar: status / priority / due date ─────────── */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 self-start">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t('details')}
              </p>

              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t('status')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          checkFormChanges();
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`task-statuses.${status}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t('priority')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          checkFormChanges();
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder={t('priority')} />
                        </SelectTrigger>
                        <SelectContent>
                          {taskPriorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {t(`task-priorities.${priority}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="duedate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t('due-date')}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700 text-[13px]"
                          >
                            {field.value
                              ? format(parseDateOnly(field.value), 'PPP')
                              : 'Pick a date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? parseDateOnly(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              checkFormChanges();
                              field.onChange(format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default TaskDetails;
