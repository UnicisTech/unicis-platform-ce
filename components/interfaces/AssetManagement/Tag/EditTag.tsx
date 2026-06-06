import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Tag } from '@/types/fleet';
import { useUpdateTag } from '@/hooks/fleets/Tags/useUpdateTag';
import { useTags } from '@/hooks/fleets/Tags/useTags';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';

const EditTag = ({
  visible,
  setVisible,
  tag,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  tag: Tag;
  fleetTeamId: string;
}) => {
  const updateTag = useUpdateTag();
  const { t } = useTranslation('common');
  const { mutateTags } = useTags(fleetTeamId);

  const [value, setValue] = useState(tag.value || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateTag(fleetTeamId, { value }, tag.id);
      toast.success(t('success'));
      mutateTags();
      setVisible(false);
    } catch {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('edit-tag')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="value">{t('tag-value')}</Label>
            <Input
              id="value"
              name="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('updating...') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTag;
