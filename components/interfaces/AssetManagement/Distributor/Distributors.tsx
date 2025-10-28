import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Button } from "@/components/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Error, Loading } from "@/components/shared";
import useCanAccess from "hooks/useCanAccess";
import { WithLoadingAndError } from "@/components/shared";
import type { Team, User } from "@prisma/client";
import { DistributedQuery } from "@/types/fleet";
import FleetStatus from "../Fleet/FleetStatus";
import CreateQuery from "./CreateDistributor";
import { useDistributors } from "@/hooks/fleets/distributors/useDistributors";
import DeleteDistributor from "./DeleteDistributorResult";
import FormattedDate from "@/components/shared/Date";
import StatusValue from "../StatusValue";
import { CodeBlock } from "@/components/shared/CodeBlock";

const Distributors = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [distributorToDelete, setDistributorToDelete] = useState<null | string>(null);

  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();

  const { tasks, isLoading, isError, mutateDistributorsTasks } = useDistributors(team?.id);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = (id: string) => {
    setDistributorToDelete(id);
    mutateDistributorsTasks();
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t("distributors")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("fleet-distributor-discription")}
              </p>
            </div>

            {canAccess("team_fleet_query", ["create"]) && (
              <Button size="sm" onClick={() => setVisible(true)}>
                {t("create")}
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sql")}</TableHead>
                  <TableHead>{t("asset")}</TableHead>
                  <TableHead>{t("total-results")}</TableHead>
                  <TableHead>{t("schedule")}</TableHead>
                  <TableHead>{t("task")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      {/* SQL */}
                      <TableCell className="align-top">
                        <Link
                          href={`/teams/${slug}/asset-management/distributors/${task.distributed_query.id}`}
                        >
                          <CodeBlock
                            language="sql"
                            shouldWrapLongLines
                            showLineNumbers={false}
                            text={task.distributed_query.sql}
                          />
                        </Link>
                      </TableCell>

                      <TableCell className="align-top">
                        <span className="text-sm">{task.node.node_key}</span>
                      </TableCell>

                      <TableCell className="align-top">
                        <span className="text-sm">{task.distributed_query.total_results}</span>
                      </TableCell>

                      <TableCell className="align-top">
                        <span className="text-sm">{task.distributed_query.not_before}</span>
                      </TableCell>

                      <TableCell className="align-top">
                        <div className="grid grid-cols-1 gap-1">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Status</p>
                            {StatusValue(task.status)}
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Timestamp</p>
                            {task.timestamp ? (
                              <FormattedDate style={"text-sm"} dateString={task.timestamp} />
                            ) : (
                              <span className="text-muted-foreground">Null</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top text-right">
                        <div className="flex justify-end gap-2">
                          {canAccess("team_fleet_pack", ["delete"]) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                openDeleteModal(task.distributed_query.id)
                              }
                            >
                              {t("delete")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-4 text-sm text-muted-foreground"
                    >
                      {t("no-distributors-found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <CreateQuery
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          <DeleteDistributor
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            distributorId={distributorToDelete!}
            fleetTeamId={team.id}
          />
        </div>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Distributors;
