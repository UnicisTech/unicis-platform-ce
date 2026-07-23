import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@/generated/client';
import toast from 'react-hot-toast';
import DeleteTag from './DeleteTag';
import { useGetTagId } from '@/hooks/fleets/Tags/useGetTagId';
import { useUpdateTag } from '@/hooks/fleets/Tags/useUpdateTag';

import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';

const TagDetails = ({
  fleetTeamId,
  tagID,
  user: _user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  tagID: string;
}) => {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const { t } = useTranslation(['common', 'fleet']);
  const { canAccess } = useCanAccess(slug);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updateTag = useUpdateTag();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<null | string>(null);

  const { tag, isLoading, isError } = useGetTagId(fleetTeamId, tagID);
  const [value, setValue] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = (id: string) => {
    setTagToDelete(id);
    setDeleteVisible(true);
  };

  const packs = tag?.packs ?? [];
  const queries = tag?.queries ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateTag(fleetTeamId, { value }, tagID);
      toast.success(t('success'));
      setIsFormChanged(false);
    } catch {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b bg-slate-50/40">
            <CardTitle>{t('details')}</CardTitle>
            <CardDescription>{tag?.value}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="value">{t('tag-value')}</Label>
              <Input
                id="value"
                name="value"
                defaultValue={tag?.value}
                onChange={(e) => {
                  setValue(e.target.value);
                  checkFormChanges();
                }}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">{t('packs')}</h3>
                </div>
                <div className="divide-y">
                  {packs.length > 0 ? (
                    packs.map((pack) => (
                      <Link
                        key={pack.id}
                        href={`/teams/${slug}/asset-management/packs/${pack.id}`}
                        className="block px-4 py-3 text-sm font-medium hover:bg-muted"
                      >
                        {pack.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      {t('no-packs-found')}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-md border">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">{t('queries')}</h3>
                </div>
                <div className="divide-y">
                  {queries.length > 0 ? (
                    queries.map((query) => (
                      <Link
                        key={query.id}
                        href={`/teams/${slug}/asset-management/queries/${query.id}`}
                        className="block px-4 py-3 text-sm font-medium hover:bg-muted"
                      >
                        {query.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      {t('fleet:no-queries-found')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-between bg-slate-50/40">
            <div>
              {canAccess('team_fleet_tag', ['delete']) && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => openDeleteModal(tag?.id ?? '')}
                >
                  {t('delete')}
                </Button>
              )}
            </div>

            {canAccess('team_fleet_tag', ['update']) && (
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !isFormChanged}
              >
                {submitting ? t('saving') : t('save-changes')}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      <DeleteTag
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        tagId={tagToDelete!}
        fleetTeamId={fleetTeamId}
      />
    </div>
  );
};

export default TagDetails;
