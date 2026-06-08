import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { SectionFilter, StatusesTable } from './';
import StatusFilter from './StatusFilter';
import { PerPageSelector, FilterChipRow } from '@/components/shared';
import { ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import type { Task } from 'types';
import CscChartsLayout from './CscChartsLayout';
import { CscStatus, CSC_STATUSES } from '@/lib/csc/csc-statuses';
import { useTranslation } from 'next-i18next';
import { isoValueToLabel } from '@/lib/csc/csc-frameworks';
import frameworks from '@/lib/csc/frameworks';
import SoaExportModal from './SoaExportModal';
import StatusPromptDialog from './StatusPromptDialog';
import { downloadSoaXlsx } from '@/lib/soa/exportXlsx';
import { downloadSoaOds } from '@/lib/soa/exportOds';
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
  const router = useRouter();
  const { t } = useTranslation(['common', `csc/${iso}`]);
  const { statuses, mutateStatuses } = useCscStatuses(slug, iso);

  // Read filter state from URL
  const sectionFilterValue = (router.query.section as string) ?? '';
  const statusFilterValue = (router.query.status as string) ?? '';
  const perPageValue = Number(router.query.perPage ?? 10);

  // Convert string values to appropriate types for internal use
  const sectionFilter = sectionFilterValue ? [sectionFilterValue] : null;
  const statusFilter = statusFilterValue ? ([statusFilterValue] as CscStatus[]) : null;
  const perPage = perPageValue;

  // Update URL with new filter values (replaces history to avoid back-stack pollution)
  const updateFilter = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            ...updates,
            // Reset to page 1 when filter changes
            ...(updates.section !== undefined || updates.status !== undefined ? { page: 1 } : {}),
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const setSectionFilter = useCallback(
    (value: string[] | null) => {
      updateFilter({ section: value?.[0] });
    },
    [updateFilter]
  );

  const setStatusFilter = useCallback(
    (value: CscStatus[] | null) => {
      updateFilter({ status: value?.[0] });
    },
    [updateFilter]
  );

  const setPerPage = useCallback(
    (value: number) => {
      updateFilter({ perPage: value });
    },
    [updateFilter]
  );

  const [soaModalOpen, setSoaModalOpen] = useState(false);

  // ── Status prompt state (shown after linking a task when status is 'unknown') ──
  const [statusPromptOpen, setStatusPromptOpen] = useState(false);
  const [statusPromptControl, setStatusPromptControl] = useState<{
    id: string;
    code: string;
    title: string;
  } | null>(null);

  /** Resolve the control code/title from the framework definition */
  const resolveControlMeta = useCallback(
    (controlId: string) => {
      const code = t(`csc/${iso}:controls.${controlId}.code`, controlId);
      const title = t(`csc/${iso}:controls.${controlId}.control`, '');
      return { code, title };
    },
    [iso, t]
  );

  /**
   * Open the status prompt dialog for a control whose status is currently 'unknown'.
   * Called after successfully linking the first task to a control.
   */
  const maybePromptStatus = useCallback(
    (controlId: string) => {
      const currentStatus = statuses[controlId] as CscStatus | undefined;
      if (currentStatus && currentStatus !== 'unknown') return;
      const { code, title } = resolveControlMeta(controlId);
      setStatusPromptControl({ id: controlId, code, title });
      setStatusPromptOpen(true);
    },
    [statuses, resolveControlMeta]
  );

  const statusHandler = useCallback(
    async (control: string, value: string): Promise<string | undefined> => {
      console.log(`[statusHandler] Called for control: ${control}, value: ${value}`);
      const { error } = await updateCscStatus({
        slug,
        control,
        value,
        framework: iso,
      });
      console.log(`[statusHandler] updateCscStatus response for ${control}:`, { error });
      if (error) {
        console.error(`[statusHandler] Error updating ${control}:`, error);
        toast.error(error.message || t('errors.requestFailed'));
        return undefined;
      }
      // Wait for the data to revalidate before returning
      console.log(`[statusHandler] Calling mutateStatuses for ${control}...`);
      await mutateStatuses();
      console.log(`[statusHandler] mutateStatuses completed for ${control}`);
      return undefined;
    },
    [slug, iso, t, mutateStatuses]
  );

  const onStatusPromptConfirm = useCallback(
    async (status: CscStatus) => {
      if (!statusPromptControl) return;
      await statusHandler(statusPromptControl.id, status);
      setStatusPromptOpen(false);
      setStatusPromptControl(null);
    },
    [statusPromptControl, statusHandler]
  );

  const onStatusPromptSkip = useCallback(() => {
    setStatusPromptOpen(false);
    setStatusPromptControl(null);
  }, []);

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
      // After successfully adding task(s), prompt for status if still 'unknown'
      if (operation === 'add') {
        maybePromptStatus(control);
      }
    },
    [slug, iso, mutateTasks, t, maybePromptStatus]
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
        // Prompt for status if still 'unknown'
        maybePromptStatus(controlId);
      }
    },
    [slug, mutateTasks, t, maybePromptStatus]
  );

  /**
   * Bulk-link tasks to mapped controls across frameworks.
   * Groups controls by framework for efficient batched API calls.
   * When sourceControlId is provided, propagates the source control's
   * status to every mapped control that gets linked.
   */
  const onBulkLinkMapped = useCallback(
    async (
      taskNumbers: number[],
      mappedControls: Array<{ controlId: string; framework: ISO }>,
      sourceControlId?: string
    ) => {
      if (taskNumbers.length === 0 || mappedControls.length === 0) return;

      // Resolve the source control's current status so we can propagate it
      const sourceStatus = sourceControlId
        ? (statuses[sourceControlId] as string | undefined)
        : undefined;

      // Group controls by framework so we make one API call per (task, framework)
      const byFramework = new Map<string, string[]>();
      for (const { controlId: cid, framework } of mappedControls) {
        if (!byFramework.has(framework)) byFramework.set(framework, []);
        byFramework.get(framework)!.push(cid);
      }

      let errorOccurred = false;
      for (const taskNumber of taskNumbers) {
        if (errorOccurred) break;
        for (const [fw, controls] of byFramework) {
          const { error } = await updateTaskCsc({
            slug,
            taskNumber,
            controls,
            operation: 'add',
            iso: fw,
          });
          if (error) {
            toast.error(error.message || t('errors.requestFailed'));
            errorOccurred = true;
            break;
          }
        }
      }

      // Propagate status from the source control to each mapped control
      if (!errorOccurred && sourceStatus && sourceStatus !== 'unknown') {
        for (const { controlId: cid, framework } of mappedControls) {
          await updateCscStatus({
            slug,
            control: cid,
            value: sourceStatus,
            framework,
          });
        }
      }

      if (!errorOccurred) {
        toast.success(t('csc-mapping.drawer.link-mapped-success'));
      }
      await mutateTasks();
    },
    [slug, mutateTasks, t, statuses]
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
      if (fmt === 'ods') {
        downloadSoaOds(payload);
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

  // Build filter chips for display
  const filterChips = [
    ...(sectionFilterValue ? [{ label: sectionFilterValue, value: sectionFilterValue, onRemove: () => setSectionFilter(null) }] : []),
    ...(statusFilterValue ? [{ label: statusFilterValue, value: statusFilterValue, onRemove: () => setStatusFilter(null) }] : []),
  ];

  const onClearAllFilters = useCallback(() => {
    updateFilter({ section: undefined, status: undefined });
  }, [updateFilter]);

  return (
    <>
      <CscChartsLayout statuses={statuses} iso={iso} />

      <FilterChipRow chips={filterChips} onClearAll={onClearAllFilters} />

      <div className="flex flex-row justify-end">
        <SectionFilter ISO={iso} setSectionFilter={setSectionFilter as any} />
        <StatusFilter setStatusFilter={setStatusFilter as any} />
        <PerPageSelector perPage={perPage} setPerPage={setPerPage as any} />

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
        slug={slug}
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
        onBulkLinkMapped={onBulkLinkMapped}
      />

      <SoaExportModal
        isOpen={soaModalOpen}
        onClose={() => setSoaModalOpen(false)}
        onExport={handleSoaExport}
        frameworkName={frameworkLabel}
      />

      {statusPromptControl && (
        <StatusPromptDialog
          isOpen={statusPromptOpen}
          controlCode={statusPromptControl.code}
          controlTitle={statusPromptControl.title}
          onConfirm={onStatusPromptConfirm}
          onSkip={onStatusPromptSkip}
        />
      )}
    </>
  );
}
