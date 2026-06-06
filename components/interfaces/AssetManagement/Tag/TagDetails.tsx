import { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Card, Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@/generated/client';
import toast from 'react-hot-toast';
import DeleteTag from './DeleteTag';
import { useGetTagId } from '@/hooks/fleets/Tags/useGetTagId';
import { useUpdateTag } from '@/hooks/fleets/Tags/useUpdateTag';

import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';

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
  const { t } = useTranslation('common');
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
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
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

        <div className="flex gap-2">
          {canAccess('team_fleet_tag', ['update']) && (
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !isFormChanged}
            >
              {submitting ? t('saving...') : t('save-changes')}
            </Button>
          )}
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
      </form>

      <DeleteTag
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        tagId={tagToDelete!}
        fleetTeamId={fleetTeamId}
      />

      <Card heading="Packs">
        {tag?.packs.map((pack) => (
          <div key={pack.id} className="rounded mb-2">
            <p className="text-xl">{pack.name}</p>
          </div>
        ))}
      </Card>

      <Card heading="Queries">
        {tag?.queries.map((query) => (
          <div key={query.id} className="rounded mb-2">
            <p className="text-xl">{query.name}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default TagDetails;
