import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Error, Loading } from "@/components/shared";
import useCanAccess from "hooks/useCanAccess";
import { useGetPackId } from "@/hooks/fleets/packs/useGetPackId";
// import { IssuePanelContainer } from "@/sharedStyles";
import { useUpdatePack } from "@/hooks/fleets/packs/useUpdatePack";
import toast from "react-hot-toast";
import { User } from "@prisma/client";
import { Badge } from "@/components/shadcn/ui/badge";

const PackTags = ({
  fleetTeamId,
  packID,
  user,
}: {
  fleetTeamId: string;
  packID: string;
  user: Partial<User>;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [packToDelete, setPackToDelete] = useState<null | string>(null);

  const updatePack = useUpdatePack();
  const { pack, isLoading, isError } = useGetPackId(fleetTeamId, packID);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = (id: string) => {
    setPackToDelete(id);
    setDeleteVisible(true);
  };

  return (
    // <IssuePanelContainer>
      <div className="flex flex-wrap gap-2">
        {pack?.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/teams/${slug}/tags/${tag.id}`}
            className="no-underline"
          >
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              {tag.value}
            </Badge>
          </Link>
        ))}
      </div>
    // </IssuePanelContainer>
  );
};

export default PackTags;
