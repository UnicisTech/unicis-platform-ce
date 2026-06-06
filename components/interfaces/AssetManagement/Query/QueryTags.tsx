import Link from 'next/link';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
// import { IssuePanelContainer } from "@/sharedStyles";
import { User } from '@/generated/client';
import { Badge } from '@/components/shadcn/ui/badge';

const PackTags = ({
  fleetTeamId,
  packID,
  user: _user,
}: {
  fleetTeamId: string;
  packID: string;
  user: Partial<User>;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { pack, isLoading, isError } = useGetPackId(fleetTeamId, packID);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

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
