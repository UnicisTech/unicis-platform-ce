import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useUpdateQuery } from '@/hooks/fleets/queries/useUpdateQuery';
import { useQueries } from '@/hooks/fleets/queries/useQueries';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';
import { PLATFORMS } from '@/lib/fleet/constants';
import { validateFleetSqlQuery } from '@/lib/fleet/sqlValidation';
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

type QueryFormErrors = Partial<
  Record<'name' | 'sql' | 'version' | 'shard' | 'interval' | 'value', string>
>;

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
  const { t } = useTranslation(['common', 'fleet']);
  const updateQuery = useUpdateQuery();
  const { mutateQueries } = useQueries(team?.id);
  const [formErrors, setFormErrors] = useState<QueryFormErrors>({});
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const sqlInputRef = useRef<HTMLInputElement | null>(null);
  const versionInputRef = useRef<HTMLInputElement | null>(null);
  const shardInputRef = useRef<HTMLInputElement | null>(null);
  const intervalInputRef = useRef<HTMLInputElement | null>(null);
  const valueInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const values = {
      name: (formData.get('name') as string) || '',
      sql: (formData.get('sql') as string) || '',
      version: (formData.get('version') as string) || '',
      shard: (formData.get('shard') as string) || '',
      interval: (formData.get('interval') as string) || '',
      value: (formData.get('value') as string) || '',
      description: (formData.get('description') as string) || '',
    };

    const nextErrors: QueryFormErrors = {};

    if (!values.name.trim()) nextErrors.name = t('name-required');
    if (!values.sql.trim()) nextErrors.sql = t('fleet:sql-query-required');
    if (!values.version.trim()) nextErrors.version = t('version-required');
    if (!values.shard.trim()) nextErrors.shard = t('shard-required');
    if (!values.interval.trim()) {
      nextErrors.interval = t('interval-required');
    }
    if (!values.value.trim()) nextErrors.value = t('value-required');

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      if (nextErrors.name) nameInputRef.current?.focus();
      else if (nextErrors.sql) sqlInputRef.current?.focus();
      else if (nextErrors.version) versionInputRef.current?.focus();
      else if (nextErrors.shard) shardInputRef.current?.focus();
      else if (nextErrors.interval) intervalInputRef.current?.focus();
      else if (nextErrors.value) valueInputRef.current?.focus();
      return;
    }

    const queryData = {
      name: values.name,
      sql: values.sql,
      platform: selectedPlatform,
      version: values.version,
      shard: Number(values.shard),
      interval: Number(values.interval),
      value: values.value,
      description: values.description,
      packs: selectedPacks,
      tags: selectedTags.join(','),
      removed,
    };

    const sqlValidation = validateFleetSqlQuery(queryData.sql);

    if (!sqlValidation.valid) {
      setFormErrors({ sql: t(sqlValidation.messageKey) });
      sqlInputRef.current?.focus();
      return;
    }

    setFormErrors({});

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
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <DialogHeader>
            <DialogTitle>{t('edit-query')}</DialogTitle>
          </DialogHeader>

          <div>
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              ref={nameInputRef}
              name="name"
              defaultValue={query.name}
              aria-invalid={!!formErrors.name}
              onChange={() =>
                setFormErrors((prev) => ({ ...prev, name: undefined }))
              }
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="sql">{t('sql-code')}</Label>
            <Input
              ref={sqlInputRef}
              name="sql"
              defaultValue={query.sql}
              aria-invalid={!!formErrors.sql}
              onChange={() =>
                setFormErrors((prev) => ({ ...prev, sql: undefined }))
              }
            />
            {formErrors.sql && (
              <p className="text-sm text-destructive">{formErrors.sql}</p>
            )}
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
              <Input
                ref={versionInputRef}
                name="version"
                defaultValue={query.version}
                aria-invalid={!!formErrors.version}
                onChange={() =>
                  setFormErrors((prev) => ({ ...prev, version: undefined }))
                }
              />
              {formErrors.version && (
                <p className="text-sm text-destructive">{formErrors.version}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shard">{t('shard')}</Label>
              <Input
                ref={shardInputRef}
                name="shard"
                defaultValue={query.shard}
                aria-invalid={!!formErrors.shard}
                onChange={() =>
                  setFormErrors((prev) => ({ ...prev, shard: undefined }))
                }
              />
              {formErrors.shard && (
                <p className="text-sm text-destructive">{formErrors.shard}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interval">{t('interval')}</Label>
              <Input
                ref={intervalInputRef}
                type="number"
                name="interval"
                defaultValue={query.interval}
                aria-invalid={!!formErrors.interval}
                onChange={() =>
                  setFormErrors((prev) => ({ ...prev, interval: undefined }))
                }
              />
              {formErrors.interval && (
                <p className="text-sm text-destructive">
                  {formErrors.interval}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="value">{t('value')}</Label>
              <Input
                ref={valueInputRef}
                name="value"
                defaultValue={query.value}
                aria-invalid={!!formErrors.value}
                onChange={() =>
                  setFormErrors((prev) => ({ ...prev, value: undefined }))
                }
              />
              {formErrors.value && (
                <p className="text-sm text-destructive">{formErrors.value}</p>
              )}
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
