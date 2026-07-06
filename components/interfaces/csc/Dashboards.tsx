import type { Team } from 'types';
import CscTabs, {
  MAPPING_MATRIX_TAB,
  MATRIX_QUERY_VALUE,
  type ActiveCscTab,
} from './CscTabs';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { ISO } from 'types';
import useISO from 'hooks/useISO';
import { Loading } from '@/components/shared';
import CscPanel from './CscPanel';
import MappingMatrixPanel from './MappingMatrixPanel';
import useTeamTasks from 'hooks/useTeamTasks';

const Dashboard = ({ team, iso }: { team: Team; iso: ISO[] }) => {
  const router = useRouter();
  const { tasks, mutateTasks } = useTeamTasks(team.slug);

  // Active framework lives in the URL (?framework=) rather than local state so
  // the shell Header can read it too and size its record-count badge to match.
  const frameworkQuery = router.query.framework as string | undefined;
  const activeTab: ActiveCscTab =
    frameworkQuery === MATRIX_QUERY_VALUE
      ? MAPPING_MATRIX_TAB
      : frameworkQuery && iso.includes(frameworkQuery as ISO)
        ? (frameworkQuery as ISO)
        : iso[0];

  const setActiveTab = useCallback(
    (tab: ActiveCscTab) => {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            framework: tab === MAPPING_MATRIX_TAB ? MATRIX_QUERY_VALUE : tab,
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  if (!tasks) {
    return <Loading />;
  }

  return (
    <>
      <CscTabs
        frameworks={iso}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div
        id="csc-tab-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === MAPPING_MATRIX_TAB
            ? 'csc-tab-matrix'
            : `csc-tab-${activeTab}`
        }
      >
        {activeTab === MAPPING_MATRIX_TAB ? (
          /* ── Mapping Matrix + Coverage Analysis tab ── */
          <MappingMatrixPanel enabledFrameworks={iso} />
        ) : (
          /* ── Standard framework control panel ── */
          <CscPanel
            key={activeTab}
            slug={team.slug}
            teamName={team.name}
            iso={activeTab as ISO}
            tasks={tasks}
            mutateTasks={mutateTasks}
            enabledFrameworks={iso}
          />
        )}
      </div>
    </>
  );
};

const WithISO = ({ team }: { team: Team }) => {
  const { ISO } = useISO(team);
  if (!ISO) return <Loading />;
  return <Dashboard team={team} iso={ISO} />;
};

export default WithISO;
