import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { SectionFilter, StatusesTable } from './';
import StatusFilter from './StatusFilter';
import { PerPageSelector } from '@/components/shared';
import { ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import { Task } from '@/generated/browser';
import CscChartsLayout from './CscChartsLayout';
import { CscStatus, CSC_STATUSES } from '@/lib/csc/csc-statuses';
import { useTranslation } from 'next-i18next';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import frameworks from '@/lib/csc/frameworks';
import SoaExportModal from './SoaExportModal';
import { downloadSoaXlsx } from '@/lib/soa/exportXlsx';
import { downloadSoaHtml } from '@/lib/soa/exportHtml';
import { downloadSoaPdf } from '@/lib/soa/exportPdf';
import type { ExportFormat, SoaPayload, SoaRow } from '@/lib/soa/types';

export async function updateCscStatus(params: {
  slug: string;
  control: string;
  value: string;
  framework: ISO;
}) {
  const res = await fetch(`/api/teams/${params.slug}/csc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      control: params.control,
      value: params.value,
      framework: params.framework,
    }),
  });
  const json = await res.json();
  return {
    data: json.data,
    error: json.error || (!res.ok ? { message: null } : null),
  };
}

export async function updateTaskCsc(params: {
  slug: string;
  taskNumber: string | number;
  controls: string[];
  operation: 'add' | 'remove';
  iso: string;
}) {
  const res = await fetch(
    `/api/teams/${params.slug}/tasks/${params.taskNumber}/csc`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        controls: params.controls,
        operation: params.operation,
        ISO: params.iso,
      }),
    }
  );
  const json = await res.json();
  return {
    data: json.data,
    error: json.error || (!res.ok ? { message: null } : null),
  };
}

interface CscPanelProps {
  slug: string;
  teamName: string;
  iso: ISO;
  tasks: Task[];
  mutateTasks: () => Promise<any>;
  /** All frameworks currently enabled for this team — forwarded to the mapping drawer */
  enabledFrameworks: ISO[];
}

export default function CscPanel({
  slug,
  teamName,
  iso,
  tasks,
  mutateTasks,
  enabledFrameworks,
}: CscPanelProps) {
  const { t } = useTranslation(['common', `csc/${iso}`]);
  const { statuses, mutateStatuses } = useCscStatuses(slug, iso);
  const [sectionFilter, setSectionFilter] = useState<string[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<CscStatus[] | null>(null);
  const [perPage, setPerPage] = useState<number>(10);
  const [soaModalOpen, setSoaModalOpen] = useState(false);

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      const { error } = await updateCscStatus({
        slug,
        control,
        value,
        framework: iso,
      });
      if (error) return toast.error(error.message || t('errors.requestFailed'));
      mutateStatuses();
    },
    [slug, iso, t]
  );

  const taskSelectorHandler = useCallback(
    async (
      action: string,
      dataToChange: Array<{ value: number }>,
      control: string
    ) => {
      const operation = action === 'select-option' ? 'add' : 'remove';
      for (const { value: taskNumber } of dataToChange) {
        const { error } = await updateTaskCsc({
          slug,
          taskNumber,
          controls: [control],
          operation,
          iso,
        });
        if (error)
          return toast.error(error.message || t('errors.requestFailed'));
        await mutateTasks();
      }
    },
    [slug, iso, mutateTasks, t]
  );

  /**
   * Called from the mapping drawer when the user links an existing task to a control.
   * Uses the same updateTaskCsc API with operation 'add'.
   */
  const onLinkTask = useCallback(
    async (taskNumber: number, controlId: string, framework: ISO) => {
      const { error } = await updateTaskCsc({
        slug,
        taskNumber,
        controls: [controlId],
        operation: 'add',
        iso: framework,
      });
      if (error) {
        toast.error(error.message || t('errors.requestFailed'));
      } else {
        toast.success(
          t('csc-mapping.drawer.link-success', 'Task linked successfully')
        );
        await mutateTasks();
      }
    },
    [slug, mutateTasks, t]
  );

  const buildPayload = useCallback((): SoaPayload => {
    const allControls = frameworks[iso]?.controls ?? [];

    const rows: SoaRow[] = allControls.map((control) => {
      const code = (statuses[control.id] as CscStatus) ?? 'unknown';
      return {
        code: t(`csc/${iso}:controls.${control.id}.code`),
        section: t(`csc/${iso}:sections.${control.sectionId}.label`),
        control: t(`csc/${iso}:controls.${control.id}.control`),
        requirements: t(`csc/${iso}:controls.${control.id}.requirements`),
        status: code,
        statusLabel: t(`statuses.${code}.label`),
        meaning: t(`statuses.${code}.description`),
      } as SoaRow;
    });

    const statusLabelMap: Record<string, string> = {};
    const statusMeaningMap: Record<string, string> = {};
    CSC_STATUSES.forEach((s) => {
      statusLabelMap[s] = t(`statuses.${s}.label`);
      statusMeaningMap[s] = t(`statuses.${s}.description`);
    });

    return {
      meta: {
        teamName,
        framework: isoValueToLabel(iso) ?? iso,
        iso,
        dateOfExport: new Date(),
        statusLabelMap,
        statusMeaningMap,
        strings: {
          docTitle: t('soa-export.doc-title'),
          organisation: t('soa-export.organisation'),
          dateOfExport: t('soa-export.date-of-export'),
          frameworkLabel: t('soa-export.framework-label'),
          statusLegend: t('soa-export.status-legend'),
          colCode: t('soa-export.col-code'),
          colSection: t('soa-export.col-section'),
          colControl: t('soa-export.col-control'),
          colRequirements: t('soa-export.col-requirements'),
          colStatus: t('soa-export.col-status'),
          colLevel: t('soa-export.col-level'),
          colMeaning: t('soa-export.col-meaning'),
          total: t('soa-export.total'),
          generatedBy: t('soa-export.generated-by'),
          controls: t('soa-export.controls'),
          legendSheetTitle: t('soa-export.legend-sheet-title'),
        },
      },
      rows,
    };
  }, [iso, statuses, t, teamName]);

  const handleSoaExport = useCallback(
    async (fmt: ExportFormat) => {
      const payload = buildPayload();
      if (fmt === 'xlsx') {
        await downloadSoaXlsx(payload);
        return;
      }
      if (fmt === 'html') {
        downloadSoaHtml(payload);
        return;
      }
      if (fmt === 'pdf') {
        downloadSoaPdf(payload);
        return;
      }
    },
    [buildPayload]
  );

  const frameworkLabel = isoValueToLabel(iso) ?? iso;

  return (
    <>
      <CscChartsLayout statuses={statuses} iso={iso} />

      <div className="flex flex-row justify-end">
        <SectionFilter ISO={iso} setSectionFilter={setSectionFilter} />
        <StatusFilter setStatusFilter={setStatusFilter} />
        <PerPageSelector perPage={perPage} setPerPage={setPerPage} />

        <button
          className="flex items-center justify-between overflow-hidden truncate rounded-md border border-input bg-transparent py-2 shadow-xs ring-offset-background data-placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate h-full px-2 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => setSoaModalOpen(true)}
          title={t('soa-export.button-title', { framework: frameworkLabel })}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {t('soa-export.button')}
        </button>
      </div>

      <StatusesTable
        ISO={iso}
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        statusHandler={statusHandler}
        taskSelectorHandler={taskSelectorHandler}
        enabledFrameworks={enabledFrameworks}
        onLinkTask={onLinkTask}
      />

      <SoaExportModal
        isOpen={soaModalOpen}
        onClose={() => setSoaModalOpen(false)}
        onExport={handleSoaExport}
        frameworkName={frameworkLabel}
      />
    </>
  );
}
