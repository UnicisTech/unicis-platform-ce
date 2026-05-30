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
import { Error, Loading, PlatformBadge, WithLoadingAndError } from "@/components/shared";
import useCanAccess from "hooks/useCanAccess";
import type { Team, User } from "@/generated/client";
import { Query } from "@/types/fleet";
import { PLATFORMS } from "@/lib/fleet/constants";
import FleetStatus from "../Fleet/FleetStatus";
import CreateQuery from "./CreateQuery";
import { useQueries } from "@/hooks/fleets/queries/useQueries";
import DeleteQuery from "./DeleteQuery";
import EditQuery from "./EditQuery";
import { CodeBlock } from "@/components/shared/CodeBlock";

const Querys = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToEdit, setQueryToEdit] = useState<Query>({} as Query);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess();
  const { queries, isLoading, isError } = useQueries(team?.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  const openEditModal = (query: Query) => {
    setQueryToEdit({ ...query });
    setEditVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t("fleet:fleet-all-queries")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("fleet:fleet-queries-listed")}
              </p>
            </div>

            {canAccess("team_fleet_query", ["create"]) && (
              <Button size="sm" onClick={() => setVisible(true)}>
                {t("create")}
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("sql")}</TableHead>
                  <TableHead>{t("platform")}</TableHead>
                  <TableHead>{t("version")}</TableHead>
                  <TableHead>{t("interval")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {queries && queries.length > 0 ? (
                  queries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>
                        <Link
                          href={`/teams/${slug}/asset-management/queries/${query.id}`}
                          className="underline text-blue-500 hover:text-blue-400"
                        >
                          {query.name}
                        </Link>
                      </TableCell>

                      <TableCell className="max-w-[500px] truncate">
                        <Link
                          href={`/teams/${slug}/asset-management/queries/${query.id}`}
                        >
                          <CodeBlock
                            language="sql"
                            showLineNumbers={false}
                            shouldWrapLongLines
                            text={query.sql}
                          />
                        </Link>
                      </TableCell>

                      <TableCell>
                        <PlatformBadge
                          value={query.platform!}
                          label={
                            PLATFORMS.find(
                              ({ value }) => value === query.platform
                            )?.label as string
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {query.version}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {query.shard}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canAccess("team_fleet_pack", ["update"]) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(query)}
                            >
                              {t("edit-task")}
                            </Button>
                          )}
                          {canAccess("team_fleet_pack", ["delete"]) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteModal(query.id)}
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
                      {t("no-queries-found")}
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
          {editVisible && (
            <EditQuery
              visible={editVisible}
              setVisible={setEditVisible}
              team={team}
              query={queryToEdit}
            />
          )}
          <DeleteQuery
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            queryId={queryToDelete!}
            fleetTeamId={team.id}
          />
        </div>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Querys;
