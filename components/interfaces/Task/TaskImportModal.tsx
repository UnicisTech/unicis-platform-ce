import React, { useMemo, useRef, useState } from 'react';
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
import type { Team, TeamProperties, ISO } from 'types';
import useTasks from 'hooks/useTasks';
import {
  downloadTaskTemplateXlsx,
  downloadTaskTemplateCsv,
  downloadTaskTemplateOds,
  parseImportFile,
  type TaskImportRow,
  VALID_PRIORITIES,
  VALID_STATUSES,
} from '@/lib/tasks/exportTasks';
import {
  getAvailableTemplates,
  generateTemplateRows,
} from '@/lib/tasks/taskTemplates';

type TabType = 'templates' | 'upload';

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

  const teamProperties = team.properties as TeamProperties;
  const enabledFrameworks = (teamProperties?.csc_iso ?? []) as ISO[];

  const cscNamespaces = useMemo(
    () => enabledFrameworks.map((iso) => `csc/${iso}`),
    [enabledFrameworks]
  );
  const { t } = useTranslation(['common', ...cscNamespaces]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [parsedRows, setParsedRows] = useState<TaskImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ISO | null>(null);

  const templates = useMemo(
    () => getAvailableTemplates(enabledFrameworks),
    [enabledFrameworks]
  );

  const validRows = parsedRows.filter((r) => !r.error);
  const errorRows = parsedRows.filter((r) => r.error);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setParsedRows([]);
    setFileName('');
    setSelectedTemplate(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTemplateSelect = (iso: ISO) => {
    setSelectedTemplate(iso);
    setParsing(true);
    setParsedRows([]);

    try {
      const rows = generateTemplateRows(iso, t);
      setParsedRows(rows);
    } catch {
      toast.error(t('task-import-error'));
    } finally {
      setParsing(false);
    }
  };

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
            description: r.description || undefined,
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
    setSelectedTemplate(null);
    setActiveTab('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setVisible(false);
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('import-tasks-title')}</DialogTitle>
          <DialogDescription>
            {activeTab === 'upload'
              ? t('import-template-description')
              : t('import-templates-description')}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            onClick={() => handleTabChange('upload')}
          >
            {t('import-from-file')}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            onClick={() => handleTabChange('templates')}
          >
            {t('framework-templates')}
          </button>
        </div>

        <div className="space-y-5 py-2">
          {/* Templates tab */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('no-frameworks-enabled')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t('no-frameworks-enabled-hint')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={selectedTemplate === template.id}
                        onChange={() => handleTemplateSelect(template.id)}
                        className="radio radio-primary radio-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {template.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('template-control-count', {
                            count: template.controlCount,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload tab */}
          {activeTab === 'upload' && (
            <>
              {/* Template download section */}
              <div className="rounded-md border p-4 space-y-2">
                <p className="text-sm font-medium">{t('download-template')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTaskTemplateOds()}
                  >
                    {t('download-ods-template')}
                  </Button>
                </div>
              </div>

              {/* File upload section */}
              <div className="space-y-2">
                <div
                  className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    className="mb-2 h-8 w-8 text-slate-500 dark:text-slate-400"
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {fileName ? (
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {fileName}
                      </span>
                    ) : (
                      t('select-file-to-import')
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t('import-file-types')}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/vnd.oasis.opendocument.spreadsheet"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}

          {/* Preview section (shared between both tabs) */}
          {parsing && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('loading')}…
            </p>
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
                    className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50"
                  >
                    {errorRows.length} {t('import-error-rows')}
                  </Badge>
                )}
              </div>

              <div className="max-h-64 overflow-auto rounded-md border text-xs">
                <table className="w-full table-fixed">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">{t('title')}</th>
                      <th className="w-20 px-3 py-2 text-left">
                        {t('status')}
                      </th>
                      <th className="w-20 px-3 py-2 text-left">
                        {t('priority')}
                      </th>
                      {activeTab === 'upload' && (
                        <th className="w-24 px-3 py-2 text-left">
                          {t('due-date')}
                        </th>
                      )}
                      {activeTab === 'upload' && (
                        <th className="w-16 px-3 py-2 text-left"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {parsedRows.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.error ? 'bg-red-50 dark:bg-red-950/20' : ''
                        }
                      >
                        <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                          {i + 1}
                        </td>
                        <td className="px-3 py-1.5 truncate" title={row.title}>
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
                        {activeTab === 'upload' && (
                          <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                            {row.duedate || '—'}
                          </td>
                        )}
                        {activeTab === 'upload' && (
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
                        )}
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
