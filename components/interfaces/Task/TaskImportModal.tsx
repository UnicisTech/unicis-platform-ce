import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import type { Team } from 'types';
import useTasks from 'hooks/useTasks';
import {
  downloadTaskTemplateXlsx,
  downloadTaskTemplateCsv,
  parseImportFile,
  type TaskImportRow,
  VALID_PRIORITIES,
  VALID_STATUSES,
} from '@/lib/tasks/exportTasks';

interface TaskImportModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}

const TaskImportModal = ({
  visible,
  setVisible,
  team,
}: TaskImportModalProps) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { mutateTasks } = useTasks(slug);
  const { t } = useTranslation('common');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<TaskImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  const validRows = parsedRows.filter((r) => !r.error);
  const errorRows = parsedRows.filter((r) => r.error);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setParsedRows([]);
    try {
      const rows = await parseImportFile(file);
      setParsedRows(rows);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('task-import-error');
      toast.error(message);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/tasks/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: validRows.map((r) => ({
            title: r.title,
            status: r.status,
            priority: r.priority,
            duedate: r.duedate || undefined,
          })),
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || t('task-import-error'));
        return;
      }
      toast.success(t('task-import-success', { count: data.count }));
      mutateTasks();
      handleClose();
    } catch {
      toast.error(t('task-import-error'));
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setParsedRows([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setVisible(false);
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('import-tasks-title')}</DialogTitle>
          <DialogDescription>
            {t('import-template-description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Template download section */}
          <div className="rounded-md border p-4 space-y-2">
            <p className="text-sm font-medium">{t('download-template')}</p>
            <p className="text-xs text-muted-foreground">
              {t('select-file-to-import')}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTaskTemplateXlsx()}
              >
                {t('download-xlsx-template')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTaskTemplateCsv()}
              >
                {t('download-csv-template')}
              </Button>
            </div>
          </div>

          {/* File upload section */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('import-from-file')}</p>
            <div
              className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="mb-2 h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="font-medium text-foreground">
                    {fileName}
                  </span>
                ) : (
                  t('select-file-to-import')
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('import-file-types')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Preview section */}
          {parsing && (
            <p className="text-sm text-muted-foreground">{t('loading')}…</p>
          )}

          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">
                  {t('task-import-preview', { count: parsedRows.length })}
                </p>
                {validRows.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {validRows.length} {t('import-valid-rows')}
                  </Badge>
                )}
                {errorRows.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    {errorRows.length} {t('import-error-rows')}
                  </Badge>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto rounded-md border text-xs">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">{t('title')}</th>
                      <th className="px-3 py-2 text-left">{t('status')}</th>
                      <th className="px-3 py-2 text-left">{t('priority')}</th>
                      <th className="px-3 py-2 text-left">{t('due-date')}</th>
                      <th className="px-3 py-2 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedRows.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.error ? 'bg-red-50 dark:bg-red-950/20' : ''
                        }
                      >
                        <td className="px-3 py-1.5 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-3 py-1.5 max-w-[200px] truncate">
                          {row.title || (
                            <span className="text-red-500 italic">
                              {t('import-field-missing')}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          {VALID_STATUSES.includes(row.status) ? (
                            row.status
                          ) : (
                            <span className="text-red-500">
                              {row.status || t('import-field-missing')}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          {VALID_PRIORITIES.includes(
                            row.priority as (typeof VALID_PRIORITIES)[number]
                          ) ? (
                            t(`task-priorities.${row.priority}`)
                          ) : (
                            <span className="text-red-500">
                              {row.priority || t('import-field-missing')}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground">
                          {row.duedate || '—'}
                        </td>
                        <td className="px-3 py-1.5">
                          {row.error && (
                            <span
                              className="text-red-500 cursor-help"
                              title={row.error}
                            >
                              ⚠ {t('import-row-error-label')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errorRows.length > 0 && (
                <p className="text-xs text-red-500">
                  {t('import-rows-skipped', { count: errorRows.length })}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={importing}>
            {t('close')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={validRows.length === 0 || importing}
          >
            {importing
              ? `${t('loading')}…`
              : `${t('import-tasks')}${validRows.length > 0 ? ` (${validRows.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskImportModal;
