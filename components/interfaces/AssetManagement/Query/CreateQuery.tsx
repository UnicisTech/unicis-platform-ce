import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { PLATFORMS } from '@/lib/fleet/constants';
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
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { User } from '@/generated/client';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface FormData {
  name: string;
  sql: string;
  interval: number;
  platform: string;
  version: string;
  value: string;
  packs: string[];
  tags: string;
  shard: number;
  description: string;
  removed: boolean;
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
  const [removed, setRemoved] = useState<boolean>(false);

  const createQuery = useCreateQuery();
  const { mutateQueries } = useQueries(fleetTeamId);

  const {
    handleSubmit,
    control,
    register,
    formState: { isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      sql: '',
      interval: 0,
      platform: DEFAULT_PLATFORM_VALUE,
      version: '',
      value: '',
      packs: [],
      tags: '',
      shard: 1,
      description: '',
      removed: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createQuery(fleetTeamId, {
        ...data,
        platform: data.platform,
        packs: selectedPacks,
        tags: selectedTags.join(','),
        removed,
      });
      toast.success(t('success'));
      mutateQueries();
      setVisible(false);
      reset();
    } catch {
      toast.error(t('error'));
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
        >
          <div>
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>

          <div>
            <Label htmlFor="sql">{t('fleet:fleet-sql-code')}</Label>
            <Input id="sql" {...register('sql', { required: true })} />
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="version">{t('version')}</Label>
              <Input
                id="version"
                {...register('version', { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="shard">{t('fleet:fleet-shard')}</Label>
              <Input
                id="shard"
                type="number"
                {...register('shard', { required: true, valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="interval">{t('interval')}</Label>
              <Input
                id="interval"
                type="number"
                {...register('interval', {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label htmlFor="value">{t('value')}</Label>
              <Input id="value" {...register('value', { required: true })} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="removed"
              checked={removed}
              onCheckedChange={() => setRemoved(!removed)}
            />
            <Label htmlFor="removed">{t('removed')}</Label>
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
