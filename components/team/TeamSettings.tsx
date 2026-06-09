import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
//TODO: insolate updateTeamSchema logic
//import { updateTeamSchema } from '@/lib/zod';
import { defaultHeaders, domainRegex } from '@/lib/common';
import type { Team } from 'types';
import type { ApiResponse } from 'types';
import { AccessControl } from '@/components/shared/AccessControl';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

interface TeamSettingsProps {
  team: Team;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain ?? '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('team-name-required')),
      slug: Yup.string().required(t('team-slug-required')),
      domain: Yup.string().nullable().matches(domainRegex, t('invalid-domain')),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const res = await fetch(`/api/teams/${team.slug}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<Team>;

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t('successfully-updated'));
        router.push(`/teams/${json.data.slug}/settings`);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            {t('team-settings')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('team-settings-config')}</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="name">{t('team-name')}</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="slug">{t('team-slug')}</Label>
            <Input
              id="slug"
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
            />
            {formik.touched.slug && formik.errors.slug && (
              <p className="text-destructive text-sm">{formik.errors.slug}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="domain">{t('team-domain')}</Label>
            <Input
              id="domain"
              name="domain"
              value={formik.values.domain}
              onChange={formik.handleChange}
              placeholder="example.com"
            />
            {formik.touched.domain && formik.errors.domain && (
              <p className="text-destructive text-sm">{formik.errors.domain}</p>
            )}
          </div>
        </div>

        <AccessControl resource="team" actions={['update']} slug={team.slug}>
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-end">
            <Button
              type="submit"
              disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t('save-changes')}
            </Button>
          </div>
        </AccessControl>
      </div>
    </form>
  );
};

export default TeamSettings;
