import type { ResultNode } from '@/hooks/fleets/results/useResults';
import { useTranslation } from 'next-i18next';

const getOwnerName = (node: ResultNode | null) => {
  const user = node?.owner?.user;
  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(' ');

  return fullName || user?.email || '';
};

const getAssetName = (node: ResultNode | null) => node?.display_name || '-';

const ResultNodeInfo = ({ node }: { node: ResultNode | null }) => {
  const { t } = useTranslation('common');
  const assetName = getAssetName(node);
  const ownerName = getOwnerName(node);

  return (
    <div className="min-w-[280px] space-y-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
      <div className="flex flex-wrap gap-x-1">
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          {t('asset-name')}:{' '}
        </span>
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {assetName}
        </span>
      </div>
      {ownerName && (
        <div className="flex flex-wrap gap-x-1">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {t('owner')}:{' '}
          </span>
          {ownerName}
        </div>
      )}
      {node?.host_identifier && (
        <div className="flex flex-wrap gap-x-1">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {t('host-identifier')}:{' '}
          </span>
          <span className="font-mono text-[12px]">{node.host_identifier}</span>
        </div>
      )}
    </div>
  );
};

export default ResultNodeInfo;
