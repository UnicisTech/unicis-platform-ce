"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import type { User } from "@/generated/client";

import { Error, Loading } from "@/components/shared";
import useCanAccess from "hooks/useCanAccess";
import { useGetPackId } from "@/hooks/fleets/packs/useGetPackId";
import FleetStatus from "../Fleet/FleetStatus";
// import { IssuePanelContainer } from "@/sharedStyles";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";

const PackTags = ({
  fleetTeamId,
  packID,
  user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  packID: string;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess(slug);

  const { pack, isLoading, isError } = useGetPackId(fleetTeamId!, packID);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const openDeleteModal = useCallback((id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <FleetStatus />
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {pack?.tags?.length ? (
          pack.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="cursor-pointer transition hover:bg-primary hover:text-white"
              onClick={() =>
                router.push(`/teams/${slug}/tags/${tag.id}`)
              }
            >
              {tag.value}
            </Badge>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("no-tags")}
          </p>
        )}
      </div>

      {canAccess("team_fleet_pack", ["update"]) && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => openDeleteModal(pack?.id!)}
          >
            {t("manage-tags")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PackTags;
