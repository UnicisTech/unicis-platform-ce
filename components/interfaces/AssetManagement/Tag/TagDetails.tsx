import { useCallback, useRef, useState } from 'react';
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
import { ChevronRight } from 'lucide-react';

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
  const [valueError, setValueError] = useState('');
  const valueInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextValue = ((formData.get('value') as string) || '').trim();

    if (!nextValue) {
      setValueError(t('required'));
      valueInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await updateTag(fleetTeamId, { value: nextValue }, tagID);
      toast.success(t('success'));
      setIsFormChanged(false);
      setValueError('');
    } catch {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <form onSubmit={handleSubmit} noValidate>
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              {t('details')}
            </span>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {tag?.value}
            </p>
          </div>

          <div className="space-y-6 p-4">
            <div className="space-y-2">
              <Label htmlFor="value">{t('tag-value')}</Label>
              <Input
                ref={valueInputRef}
                id="value"
                name="value"
                defaultValue={tag?.value}
                aria-invalid={!!valueError}
                onChange={() => {
                  setValueError('');
                  checkFormChanges();
                }}
              />
              {valueError && (
                <p className="text-sm text-destructive">{valueError}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    {t('packs')}
                  </h3>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {packs.length}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {packs.length > 0 ? (
                    packs.map((pack) => (
                      <Link
                        key={pack.id}
                        href={`/teams/${slug}/asset-management/packs/${pack.id}`}
                        className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {pack.name}
                          </span>
                          {pack.description && (
                            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                              {pack.description}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                          aria-hidden="true"
                        />
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t('no-packs-found')}
                    </p>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    {t('queries')}
                  </h3>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {queries.length}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {queries.length > 0 ? (
                    queries.map((query) => (
                      <Link
                        key={query.id}
                        href={`/teams/${slug}/asset-management/queries/${query.id}`}
                        className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {query.name}
                          </span>
                          {(query.description || query.sql) && (
                            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                              {query.description || query.sql}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                          aria-hidden="true"
                        />
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t('fleet:no-queries-found')}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {canAccess('team_fleet_tag', ['delete']) && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
                disabled={submitting || !isFormChanged}
              >
                {submitting ? t('saving') : t('save-changes')}
              </Button>
            )}
          </div>
        </form>
      </div>

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
