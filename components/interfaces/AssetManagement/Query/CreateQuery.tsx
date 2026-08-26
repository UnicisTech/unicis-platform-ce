import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import {
  DEFAULT_FLEET_CONFIG_SHARD,
  DEFAULT_FLEET_CONFIG_VALUE,
  DEFAULT_FLEET_CONFIG_VERSION,
  DEFAULT_QUERY_INTERVAL,
  PLATFORMS,
  QUERY_INTERVAL_OPTIONS,
} from '@/lib/fleet/constants';
import { validateFleetSqlQuery } from '@/lib/fleet/sqlValidation';
import { useCreateQuery } from '@/hooks/fleets/queries/useCreateQuery';
import { useQueries } from '@/hooks/fleets/queries/useQueries';
import PacksSelector from '../PacksSelector';
import TagsSelector from '../TagsSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { User } from '@/generated/client';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface FormData {
  name: string;
  sql: string;
  interval: number;
  platform: string;
  packs: string[];
  tags: string;
  description: string;
}

const DEFAULT_PLATFORM_VALUE = 'all';

export default function CreateQuery({
  visible,
  setVisible,
  user: _user,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) {
  const { t } = useTranslation(['common', 'fleet']);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const createQuery = useCreateQuery();
  const { mutateQueries } = useQueries(fleetTeamId);

  const {
    handleSubmit,
    control,
    register,
    setError,
    setFocus,
    clearErrors,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      sql: '',
      interval: DEFAULT_QUERY_INTERVAL,
      platform: DEFAULT_PLATFORM_VALUE,
      packs: [],
      tags: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const sqlValidation = validateFleetSqlQuery(data.sql);

    if (!sqlValidation.valid) {
      setError('sql', {
        type: 'validate',
        message: t(sqlValidation.messageKey),
      });
      setFocus('sql');
      return;
    }

    clearErrors('sql');

    try {
      await createQuery(fleetTeamId, {
        ...data,
        platform: data.platform,
        version: DEFAULT_FLEET_CONFIG_VERSION,
        shard: DEFAULT_FLEET_CONFIG_SHARD,
        value: DEFAULT_FLEET_CONFIG_VALUE,
        removed: false,
        packs: selectedPacks,
        tags: selectedTags.join(','),
      });
      toast.success(t('success'));
      mutateQueries();
      setVisible(false);
      reset();
    } catch (error: any) {
      toast.error(error?.message || t('error'));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30">
        <DialogHeader>
          <DialogTitle>{t('fleet:fleet-create-query')}</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              aria-invalid={!!errors.name}
              {...register('name', { required: t('name-required') })}
            />
            {errors.name?.message && (
              <p className="text-sm text-destructive">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sql">{t('fleet:fleet-sql-code')}</Label>
            <Input
              id="sql"
              aria-invalid={!!errors.sql}
              {...register('sql', {
                required: t('fleet:sql-query-required'),
              })}
            />
            {errors.sql?.message && (
              <p className="text-sm text-destructive">
                {String(errors.sql.message)}
              </p>
            )}
          </div>

          <div>
            <Label>{t('platform')}</Label>
            <Controller
              control={control}
              name="platform"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select-platform')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="interval">{t('interval')}</Label>
            <Controller
              control={control}
              name="interval"
              rules={{ required: t('interval-required') }}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    clearErrors('interval');
                  }}
                >
                  <SelectTrigger id="interval" aria-invalid={!!errors.interval}>
                    <SelectValue placeholder={t('interval')} />
                  </SelectTrigger>
                  <SelectContent>
                    {QUERY_INTERVAL_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.interval?.message && (
              <p className="text-sm text-destructive">
                {String(errors.interval.message)}
              </p>
            )}
          </div>

          <div>
            <Label>{t('description')}</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <ReactQuill theme="snow" {...field} />}
            />
          </div>

          <div>
            <Label>{t('fleet:fleet-assign-packs')}</Label>
            <PacksSelector
              fleetTeamId={fleetTeamId}
              setSectionPack={setSelectedPacks}
              onSelect={() => {}}
            />
          </div>

          <div>
            <Label>{t('tags')}</Label>
            <TagsSelector
              fleetTeamId={fleetTeamId}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
