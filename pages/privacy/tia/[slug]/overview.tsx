import type { NextPageWithLayout } from "types";
import { useRouter } from "next/router";

import { Card } from "@/components/ui";
import { Loading, Error } from "@/components/ui";
// import { TIATab } from "@/components/interfaces/TIA";
import useTeam from "hooks/useTeam";
import { Badge } from "react-daisyui";

const AuditLogs: NextPageWithLayout = (props) => {
  const router = useRouter();
  const { slug } = router.query;

  const { isLoading, isError, team } = useTeam(slug as string);

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{team.name}</h3>
      {/* <TIATab team={team} activeTab="audit-logs" /> */}
      <Card heading="Overview">
        <Card.Body className="px-3 py-3">
          <div className="space-y-3">
            <p className="text-sm">
              Overview displayed with: https://www.chartjs.org/docs/latest/charts/doughnut.html#doughnut
            </p>
            <Badge color="warning">Coming Soon</Badge>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AuditLogs;
