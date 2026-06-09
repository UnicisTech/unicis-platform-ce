import React, { useRef, useState } from 'react';
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
import type { ImportRow } from '@/lib/modules/import';

export interface ModuleImportConfig<T extends ImportRow> {
  /** Module key for i18n, e.g. 'rpa', 'tia', 'pia', 'rm' */
  moduleKey: string;
  /** Column headers for the preview table */
  previewHeaders: string[];
  /** Extract preview cell values from a parsed row */
  previewCells: (row: T) => string[];
  /** Parse uploaded file into typed rows */
  parseFile: (file: File) => Promise<T[]>;
  /** Template download functions */
  downloadXlsx: () => void | Promise<void>;
  downloadCsv: () => void;
  downloadOds: () => void;
  /** Build the API payload from valid rows */
  buildPayload: (rows: T[]) => Record<string, unknown>;
  /** API endpoint for bulk import (POST) */
  apiEndpoint: string;
}

interface ModuleImportModalProps<T extends ImportRow> {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  config: ModuleImportConfig<T>;
  onSuccess: () => void;
}

function ModuleImportModal<T extends ImportRow>({
  visible,
  setVisible,
  config,
  onSuccess,
}: ModuleImportModalProps<T>) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<T[]>([]);
  const [fileName, setFileName] = useState('');
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
      const rows = await config.parseFile(file);
      setParsedRows(rows);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('module-import-error');
      toast.error(message);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.buildPayload(validRows)),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || t('module-import-error'));
        return;
      }
      toast.success(t('module-import-success', { count: data.count }));
      onSuccess();
      handleClose();
    } catch {
      toast.error(t('module-import-error'));
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
          <DialogTitle>{t(`import-${config.moduleKey}-title`)}</DialogTitle>
          <DialogDescription>
            {t('import-module-description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
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
                onClick={() => config.downloadXlsx()}
              >
                {t('download-xlsx-template')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => config.downloadCsv()}
              >
                {t('download-csv-template')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => config.downloadOds()}
              >
                {t('download-ods-template')}
              </Button>
            </div>
          </div>

          {/* File upload section */}
          <div className="space-y-2">
            <div
              className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 cursor-pointer hover:border-blue-300 transition-colors"
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

          {/* Preview section */}
          {parsing && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}…</p>
          )}

          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">
                  {t('module-import-preview', { count: parsedRows.length })}
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
                      {config.previewHeaders.map((h) => (
                        <th key={h} className="px-3 py-2 text-left">
                          {h}
                        </th>
                      ))}
                      <th className="w-16 px-3 py-2 text-left"></th>
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
                        {config.previewCells(row).map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-1.5 truncate"
                            title={cell}
                          >
                            {cell || (
                              <span className="text-slate-500 dark:text-slate-400">—</span>
                            )}
                          </td>
                        ))}
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
              : `${t(`import-${config.moduleKey}`)}${validRows.length > 0 ? ` (${validRows.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModuleImportModal;
