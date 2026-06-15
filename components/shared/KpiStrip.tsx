/**
 * KpiStrip — thin re-export shim.
 *
 * The canonical KpiCard implementation lives in
 * components/interfaces/TeamDashboard/KpiRow.tsx which supports
 * variant colours, hero sizing, and proper dark-mode borders.
 * This file re-exports those so that any shared consumer stays in sync.
 */
export {
  KpiCard,
  type KpiCardProps,
} from '@/components/interfaces/TeamDashboard/KpiRow';

export { KpiStrip } from '@/components/interfaces/TeamDashboard/KpiStrip';
