import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { ChartBarIcon, QueueListIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/shadcn/ui/command';
import useTeamTasks from 'hooks/useTeamTasks';
import useCanAccess from 'hooks/useCanAccess';
import { cn } from '@/components/shadcn/lib/utils';
import type { Task } from 'types';

// ── Module logo helper ─────────────────────────────────────────────────────────
function LogoIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={16}
      height={16}
      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
    />
  );
}

// ── Module nav items — icons mirror TeamNavigation.tsx exactly ────────────────
const MODULE_ITEMS: {
  labelKey: string;
  path: string;
  Icon: () => JSX.Element;
}[] = [
  {
    labelKey: 'team-dashboard',
    path: '/dashboard',
    Icon: () => (
      <ChartBarIcon className="w-4 h-4 fill-blue-600 flex-shrink-0" />
    ),
  },
  {
    labelKey: 'all-tasks',
    path: '/tasks',
    Icon: () => (
      <QueueListIcon className="w-4 h-4 fill-blue-600 flex-shrink-0" />
    ),
  },
  {
    labelKey: 'rpa-activities',
    path: '/rpa',
    Icon: () => <LogoIcon src="/unicis-rpa-logo.png" />,
  },
  {
    labelKey: 'tia',
    path: '/tia',
    Icon: () => <LogoIcon src="/unicis-tia-logo.png" />,
  },
  {
    labelKey: 'pia',
    path: '/pia',
    Icon: () => <LogoIcon src="/unicis-privacy-impact-logo.png" />,
  },
  {
    labelKey: 'csc',
    path: '/csc',
    Icon: () => <LogoIcon src="/unicis-csc-logo.png" />,
  },
  {
    labelKey: 'iap',
    path: '/iap',
    Icon: () => <LogoIcon src="/unicis-iap-logo.png" />,
  },
  {
    labelKey: 'rm',
    path: '/risk-management',
    Icon: () => <LogoIcon src="/unicis-risk-logo.png" />,
  },
  {
    labelKey: 'settings',
    path: '/settings',
    Icon: () => (
      <Cog6ToothIcon className="w-4 h-4 stroke-blue-600 flex-shrink-0" />
    ),
  },
];

// ── Module badge colours ───────────────────────────────────────────────────────
const MODULE_BADGE: Record<string, string> = {
  rpa: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700',
  tia: 'bg-purple-50 text-purple-700',
  pia: 'bg-rose-50 text-rose-700',
  csc: 'bg-emerald-50 text-emerald-700',
  rm: 'bg-amber-50 text-amber-700',
};

// ── Status colour dot ──────────────────────────────────────────────────────────
const STATUS_DOTS: Record<string, string> = {
  todo: 'bg-slate-400',
  'in-progress': 'bg-ub-blue',
  'in-review': 'bg-ub-purple',
  feedback: 'bg-ub-amber',
  done: 'bg-ub-green',
  failed: 'bg-ub-red',
};

// ── Collect which modules a task belongs to ────────────────────────────────────
function getTaskModuleKeys(props: Record<string, unknown> | null): string[] {
  if (!props) return [];
  const keys: string[] = [];
  if (props.rpa_procedure && (props.rpa_procedure as unknown[]).length > 0)
    keys.push('rpa');
  if (props.tia_procedure && (props.tia_procedure as unknown[]).length > 0)
    keys.push('tia');
  if (props.pia_risk && (props.pia_risk as unknown[]).length > 0)
    keys.push('pia');
  if (props.csc_controls && (props.csc_controls as unknown[]).length > 0)
    keys.push('csc');
  if (props.rm_risk && (props.rm_risk as unknown[]).length > 0) keys.push('rm');
  return keys;
}

// ── Build a flat string of ALL searchable text for a task ─────────────────────
// This feeds into cmdk's value prop so fuzzy-search spans every field.
function buildSearchIndex(task: Task): string {
  const parts: string[] = [
    String(task.taskNumber),
    task.title,
    (task as Task & { description?: string }).description ?? '',
    task.status,
    task.priority,
  ];

  const props = task.properties as Record<string, unknown> | null;
  if (!props) return parts.filter(Boolean).join(' ');

  // ── RPA ────────────────────────────────────────────────────────────────────
  const rpa = props.rpa_procedure as unknown[] | undefined;
  if (Array.isArray(rpa) && rpa.length > 0) {
    const info = rpa[0] as Record<string, unknown> | undefined;
    const details = rpa[1] as Record<string, unknown> | undefined;
    const recip = rpa[2] as Record<string, unknown> | undefined;
    const xfer = rpa[3] as Record<string, unknown> | undefined;
    if (info) {
      parts.push(str(info.controller), str(info.dpo), str(info.reviewDate));
    }
    if (details) {
      parts.push(
        str(details.purpose),
        str(details.retentionperiod),
        str(details.commentsretention),
        ...arr(details.category),
        ...arr(details.datasubject),
        ...arr(details.specialcategory)
      );
    }
    if (recip) {
      parts.push(str(recip.recipientType), str(recip.recipientdetails));
    }
    if (xfer) {
      parts.push(
        str(xfer.recipient),
        str(xfer.country),
        ...arr(xfer.guarantee)
      );
    }
  }

  // ── TIA ────────────────────────────────────────────────────────────────────
  const tia = props.tia_procedure as unknown[] | undefined;
  if (Array.isArray(tia) && tia.length > 0) {
    const info = tia[0] as Record<string, unknown> | undefined;
    if (info) {
      parts.push(
        str(info.DataExporter),
        str(info.CountryDataExporter),
        str(info.DataImporter),
        str(info.CountryDataImporter),
        str(info.TransferScenario),
        str(info.DataAtIssue),
        str(info.HowDataTransfer),
        str(info.LawImporterCountry)
      );
    }
    const step2 = tia[1] as Record<string, unknown> | undefined;
    if (step2) {
      parts.push(
        str(step2.ReasonEncryptionInTransit),
        str(step2.ReasonTransferMechanism),
        str(step2.ReasonLawfulAccess)
      );
    }
  }

  // ── PIA ────────────────────────────────────────────────────────────────────
  const pia = props.pia_risk as unknown[] | undefined;
  if (Array.isArray(pia) && pia.length > 0) {
    const nec = pia[0] as Record<string, unknown> | undefined;
    const conf = pia[1] as Record<string, unknown> | undefined;
    const avail = pia[2] as Record<string, unknown> | undefined;
    const trans = pia[3] as Record<string, unknown> | undefined;
    const guar = pia[4] as Record<string, unknown> | undefined;
    if (nec)
      parts.push(
        str(nec.isDataProcessingNecessaryAssessment),
        str(nec.isProportionalToPurposeAssessment)
      );
    if (conf) parts.push(str(conf.confidentialityAssessment));
    if (avail) parts.push(str(avail.availabilityAssessment));
    if (trans) parts.push(str(trans.transparencyAssessment));
    if (guar)
      parts.push(
        str(guar.guarantees),
        str(guar.securityMeasures),
        str(guar.dealingWithResidualRiskAssessment)
      );
  }

  // ── Risk Management ─────────────────────────────────────────────────────────
  const rm = props.rm_risk as unknown[] | undefined;
  if (Array.isArray(rm) && rm.length > 0) {
    const risk = rm[0] as Record<string, unknown> | undefined;
    const treat = rm[1] as Record<string, unknown> | undefined;
    if (risk)
      parts.push(str(risk.Risk), str(risk.AssetOwner), str(risk.Impact));
    if (treat) parts.push(str(treat.RiskTreatment), str(treat.TreatmentCost));
  }

  // ── CSC control IDs ─────────────────────────────────────────────────────────
  const csc = props.csc_controls;
  if (Array.isArray(csc)) {
    parts.push(...csc.map(String));
  }

  return parts.filter(Boolean).join(' ');
}

// tiny helpers
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] =>
  Array.isArray(v) ? (v as unknown[]).map((x) => str(x)).filter(Boolean) : [];

// ── Keyboard shortcut hint ─────────────────────────────────────────────────────
function ShortcutHint() {
  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().includes('MAC');
  return (
    <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
      {isMac ? '⌘' : 'Ctrl'}
      <span>K</span>
    </kbd>
  );
}

// ── Task row inside the dialog ─────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const props = task.properties as Record<string, unknown> | null;
  const moduleKeys = getTaskModuleKeys(props);
  const description = (task as Task & { description?: string }).description;

  return (
    <div className="flex items-start gap-2 min-w-0 flex-1">
      {/* Module icon: use module logo if has exactly 1 module, else QueueList */}
      <div className="flex-shrink-0 mt-0.5">
        {moduleKeys.length === 1 && moduleKeys[0] === 'rpa' && (
          <LogoIcon src="/unicis-rpa-logo.png" />
        )}
        {moduleKeys.length === 1 && moduleKeys[0] === 'tia' && (
          <LogoIcon src="/unicis-tia-logo.png" />
        )}
        {moduleKeys.length === 1 && moduleKeys[0] === 'pia' && (
          <LogoIcon src="/unicis-privacy-impact-logo.png" />
        )}
        {moduleKeys.length === 1 && moduleKeys[0] === 'csc' && (
          <LogoIcon src="/unicis-csc-logo.png" />
        )}
        {moduleKeys.length === 1 && moduleKeys[0] === 'rm' && (
          <LogoIcon src="/unicis-risk-logo.png" />
        )}
        {(moduleKeys.length === 0 || moduleKeys.length > 1) && (
          <QueueListIcon className="w-4 h-4 fill-blue-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status dot */}
          <span
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              STATUS_DOTS[task.status] ?? 'bg-slate-300 dark:bg-slate-600'
            )}
          />
          <span className="text-[13px] font-medium truncate">{task.title}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
            #{task.taskNumber}
          </span>
        </div>

        {/* Module badges + description snippet */}
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {moduleKeys.map((key) => (
            <span
              key={key}
              className={cn(
                'inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium leading-4',
                MODULE_BADGE[key] ??
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              {key.toUpperCase()}
            </span>
          ))}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[300px]">
              {description
                .replace(/<[^>]+>/g, ' ')
                .trim()
                .slice(0, 120)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const slug = (router.query.slug as string) || '';
  const { tasks } = useTeamTasks(slug);
  const { canAccess } = useCanAccess(slug);

  // ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  // Filter module items by access — mirrors TeamNavigation.tsx visibility rules
  const visibleModules = MODULE_ITEMS.filter((m) => {
    if (!slug) return false;
    if (m.path === '/rpa') return canAccess('rpa', ['read']);
    if (m.path === '/tia') return canAccess('tia', ['read']);
    if (m.path === '/pia') return canAccess('pia', ['read']);
    if (m.path === '/csc') return canAccess('csc', ['read']);
    if (m.path === '/iap') return canAccess('iap_course', ['update']);
    if (m.path === '/risk-management') return canAccess('rm', ['read']);
    return true; // dashboard, tasks, settings always shown
  });

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:border-ub-blue-border px-2.5 py-1.5 text-[12px] text-slate-500 dark:text-slate-400 transition-colors"
        aria-label={t('search.placeholder')}
      >
        <Search size={13} aria-hidden />
        <span className="hidden sm:inline text-[12px]">
          {t('search.placeholder')}
        </span>
        <ShortcutHint />
      </button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('search.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('search.no-results')}</CommandEmpty>

          {/* Quick navigate */}
          <CommandGroup heading={t('search.quick-nav')}>
            {visibleModules.map((m) => (
              <CommandItem
                key={m.path}
                value={`nav ${m.path} ${t(m.labelKey)}`}
                onSelect={() => navigate(`/teams/${slug}${m.path}`)}
                className="flex items-center gap-2.5"
              >
                <m.Icon />
                <span className="text-[13px]">{t(m.labelKey)}</span>
                <CommandShortcut>{t('search.open')}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Tasks — full-text search across all module fields */}
          {tasks && tasks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('search.tasks')}>
                {tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    // value = the full search index; cmdk filters on this string
                    value={buildSearchIndex(task)}
                    onSelect={() =>
                      navigate(`/teams/${slug}/tasks/${task.taskNumber}`)
                    }
                    className="py-2"
                  >
                    <TaskRow task={task} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
