import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { validateFleetSqlQuery } from '@/lib/fleet/sqlValidation';
import toast from 'react-hot-toast';
import DeleteQuery from './DeleteQuery';
import { useGetQueryId } from '@/hooks/fleets/queries/useGetQueryId';
import { useUpdateQuery } from '@/hooks/fleets/queries/useUpdateQuery';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';
import { Input } from '@/components/shadcn/ui/input';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';

interface Option {
  label: string;
  value: string;
}

type QueryFormErrors = Partial<
  Record<'name' | 'sql' | 'version' | 'shard' | 'interval' | 'value', string>
>;

const QueryDetails = ({
  user: _user,
  queryID,
  fleetTeamId,
}: {
  user: Partial<User>;
  queryID: string;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const sqlInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const { canAccess } = useCanAccess(slug);
  const updateQuery = useUpdateQuery();
  const { query, isLoading } = useGetQueryId(fleetTeamId, queryID);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [removed, setRemoved] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);
  const [formErrors, setFormErrors] = useState<QueryFormErrors>({});
  const versionInputRef = useRef<HTMLInputElement | null>(null);
  const shardInputRef = useRef<HTMLInputElement | null>(null);
  const intervalInputRef = useRef<HTMLInputElement | null>(null);
  const valueInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemoved(query.removed);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPlatform(
        PLATFORMS.find((p) => p.value === query.platform)?.value || 'all'
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPacks(query.packs?.map((p) => p.id) || []);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTags(query.tags?.map((t) => t.value) || []);
    }
  }, [query]);

  if (isLoading) return <Loading />;

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
      await updateQuery(fleetTeamId, queryData, queryID);
      toast.success(t('successfully-updated-query'));
    } catch {
      toast.error(t('error-updating-query'));
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-6"
        noValidate
      >
        <div className="flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              ref={nameInputRef}
              id="name"
              name="name"
              defaultValue={query?.name}
              aria-invalid={!!formErrors.name}
              onChange={() =>
                setFormErrors((prev) => ({ ...prev, name: undefined }))
              }
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sql">{t('sql-code')}</Label>
            <Input
              ref={sqlInputRef}
              id="sql"
              name="sql"
              defaultValue={query?.sql}
              aria-invalid={!!formErrors.sql}
              onChange={() =>
                setFormErrors((prev) => ({ ...prev, sql: undefined }))
              }
            />
            {formErrors.sql && (
              <p className="text-sm text-destructive">{formErrors.sql}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="platform">{t('platform')}</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select-platform')} />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((option: Option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="version">{t('version')}</Label>
              <Input
                ref={versionInputRef}
                id="version"
                name="version"
                defaultValue={query?.version}
                aria-invalid={!!formErrors.version}
                onChange={() =>
                  setFormErrors((prev) => ({ ...prev, version: undefined }))
                }
              />
              {formErrors.version && (
                <p className="text-sm text-destructive">{formErrors.version}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="shard">{t('shard')}</Label>
              <Input
                ref={shardInputRef}
                id="shard"
                type="number"
                name="shard"
                defaultValue={query?.shard}
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="interval">{t('interval')}</Label>
              <Input
                ref={intervalInputRef}
                id="interval"
                type="number"
                name="interval"
                defaultValue={query?.interval}
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="value">{t('value')}</Label>
              <Input
                ref={valueInputRef}
                id="value"
                name="value"
                defaultValue={query?.value}
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="removed"
              checked={removed}
              onCheckedChange={(checked) => setRemoved(!!checked)}
            />
            <Label htmlFor="removed">{t('removed')}</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('assign-packs')}</Label>
            <PacksSelector
              fleetTeamId={fleetTeamId}
              preSelectedPack={query?.packs}
              setSectionPack={setSelectedPacks}
              onSelect={() => {}}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('tags')}</Label>
            <TagsSelector
              fleetTeamId={fleetTeamId}
              preSelectedTag={query?.tags}
              setSectionTag={setSelectedTags}
              onSelect={() => {}}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {canAccess('team_fleet_query', ['delete']) && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setQueryToDelete(queryID);
                  setDeleteVisible(true);
                }}
              >
                {t('delete')}
              </Button>
            )}
          </div>
          {canAccess('team_fleet_query', ['update']) && (
            <Button type="submit">{t('save-changes')}</Button>
          )}
        </div>
      </form>

      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        queryId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
      />
    </div>
  );
};

export default QueryDetails;
