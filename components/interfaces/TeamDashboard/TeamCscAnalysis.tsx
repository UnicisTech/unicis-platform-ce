import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import useISO from 'hooks/useISO';
import { Loading } from '@/components/shared';
import { Team } from '@/generated/browser';
import type { ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import CscTabs from '../csc/CscTabs';
import CscChartsLayout from '../csc/CscChartsLayout';

const TeamCscAnalysis = ({
  slug,
  cscFrameworks,
}: {
  slug: string;
  cscFrameworks: ISO[];
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ISO>(cscFrameworks[0]);
  const { statuses } = useCscStatuses(slug, activeTab);

  if (!statuses) {
    return <Loading />;
  }
  return (
    <div className="mx-auto mt-4 w-full max-w-7xl rounded-md">
      <div className="mb-4 mx-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('cybersecurity-controls-overview')}
        </h2>
      </div>
      <CscTabs
        frameworks={cscFrameworks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showMatrixMapping={false}
      />
      <CscChartsLayout statuses={statuses} iso={activeTab} />
    </div>
  );
};

//TODO: remake
const WithISO = ({ team }: { team: Team }) => {
  const { ISO } = useISO(team);

  if (!ISO) {
    return <Loading />;
  }

  return <TeamCscAnalysis slug={team.slug} cscFrameworks={ISO} />;
};

export default WithISO;
