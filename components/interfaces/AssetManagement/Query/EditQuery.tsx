import React, { useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useUpdateQuery } from '@/hooks/fleets/queries/useUpdateQuery';
import { useQueries } from '@/hooks/fleets/queries/useQueries';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';
import { PLATFORMS } from '@/lib/fleet/constants';
import type { Team } from '@/generated/client';
import type { Query } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const EditQuery = ({
  visible,
  setVisible,
  query,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  query: Query;
  team: Team;
}) => {
  const [selectedPacks, setSelectedPacks] = useState<string[]>(
    query.packs?.map((p) => p.id) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    query.tags?.map((t) => t.value) || []
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    PLATFORMS.find(({ value }) => value === query.platform)?.value || 'all'
  );
  const [removed, setRemoved] = useState<boolean>(query.removed);
  const { t } = useTranslation('common');
  const updateQuery = useUpdateQuery();
  const { mutateQueries } = useQueries(team?.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const queryData = {
      name: formData.get('name') as string,
      sql: formData.get('sql') as string,
      platform: selectedPlatform,
      version: formData.get('version') as string,
      shard: Number(formData.get('shard')),
      interval: Number(formData.get('interval')),
      value: formData.get('value') as string,
      description: formData.get('description') as string,
      packs: selectedPacks,
      tags: selectedTags.join(','),
      removed,
    };

    try {
      await updateQuery(team.id, queryData, query.id);
      toast.success(t('successfully-updated'));
      mutateQueries();
      setVisible(false);
    } catch {
      toast.error(t('error-updating-query'));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{t('edit-query')}</DialogTitle>
          </DialogHeader>

          <div>
            <Label htmlFor="name">{t('name')}</Label>
            <Input name="name" defaultValue={query.name} required />
          </div>

          <div>
            <Label htmlFor="sql">{t('sql-code')}</Label>
            <Input name="sql" defaultValue={query.sql} required />
          </div>

          <div>
            <Label htmlFor="platform">{t('platform')}</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select-platform')} />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">{t('version')}</Label>
              <Input name="version" defaultValue={query.version} required />
            </div>
            <div>
              <Label htmlFor="shard">{t('shard')}</Label>
              <Input name="shard" defaultValue={query.shard} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interval">{t('interval')}</Label>
              <Input
                type="number"
                name="interval"
                defaultValue={query.interval}
                required
              />
            </div>
            <div>
              <Label htmlFor="value">{t('value')}</Label>
              <Input name="value" defaultValue={query.value} required />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={removed}
              onCheckedChange={(checked) => setRemoved(!!checked)}
            />
            <Label htmlFor="removed">{t('removed')}</Label>
          </div>

          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <ReactQuill theme="snow" defaultValue={query.description} />
          </div>

          <div>
            <Label>{t('assign-packs')}</Label>
            <PacksSelector
              fleetTeamId={team.id}
              preSelectedPack={query.packs}
              setSectionPack={setSelectedPacks}
              onSelect={() => {}}
            />
          </div>

          <div>
            <Label>{t('tags')}</Label>
            <TagsSelector
              fleetTeamId={team.id}
              preSelectedTag={query.tags}
              setSectionTag={setSelectedTags}
              onSelect={() => {}}
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
            <Button type="submit">{t('save-changes')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuery;
