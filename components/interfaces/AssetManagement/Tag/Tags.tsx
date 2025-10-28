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
import { Error, Loading, WithLoadingAndError } from "@/components/shared";
import useCanAccess from "hooks/useCanAccess";
import type { Team, User } from "@prisma/client";
import FleetStatus from "../Fleet/FleetStatus";
import CreateTag from "./CreateTag";
import DeleteTag from "./DeleteTag";
import EditTag from "./EditTag";
import FormattedDate from "@/components/shared/Date";
import { useTags } from "@/hooks/fleets/Tags/useTags";
import { Tag } from "@/types";

const Tags = ({ team, user }: { team: Team; user: Partial<User> }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag>({} as Tag);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);

  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();
  const { tags, isLoading, isError } = useTags(team.id);

  if (isLoading) return <Loading />;

  const openDeleteModal = (id: string) => {
    setTagToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      {user ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t("fleet-all-tags")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("fleet-tag-listed")}
              </p>
            </div>

            {canAccess("team_fleet_tag", ["create"]) && (
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
                  <TableHead>{t("tag")}</TableHead>
                  <TableHead>{t("created-at")}</TableHead>
                  <TableHead>{t("analysis")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Link
                          href={`/teams/${slug}/asset-management/tags/${tag.id}`}
                          className="underline text-blue-500 hover:text-blue-400"
                        >
                          {tag.value}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <FormattedDate
                          style="text-xs text-muted-foreground"
                          dateString={tag.updated_at}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
                          <div>
                            <p className="text-[10px] text-muted-foreground">assets</p>
                            <span>{tag.nodes_count}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">queries</p>
                            <span>{tag.queries_count}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">files</p>
                            <span>{tag.file_paths_count}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">packs</p>
                            <span>{tag.packs_count}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canAccess("team_fleet_tag", ["delete"]) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteModal(tag.id)}
                            >
                              {t("delete")}
                            </Button>
                          )}
                          {canAccess("team_fleet_tag", ["update"]) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTagToEdit(tag);
                                setEditVisible(true);
                              }}
                            >
                              {t("edit")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                      {t("no-tags-found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              {/* <TableCaption className="text-xs text-muted-foreground">
                {t("fleet-tag-caption")}
              </TableCaption> */}
            </Table>
          </div>

          {/* Modals */}
          <CreateTag
            user={user}
            fleetTeamId={team.id}
            visible={visible}
            setVisible={setVisible}
          />
          <DeleteTag
            visible={deleteVisible}
            setVisible={setDeleteVisible}
            tagId={tagToDelete!}
            fleetTeamId={team.id}
          />
          <EditTag
            visible={editVisible}
            setVisible={setEditVisible}
            tag={tagToEdit}
            fleetTeamId={team.id}
          />
        </div>
      ) : (
        <FleetStatus status="disconnected" />
      )}
    </WithLoadingAndError>
  );
};

export default Tags;
