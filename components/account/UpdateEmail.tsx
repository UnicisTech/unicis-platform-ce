import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse, UserReturned } from 'types';
import type { User } from 'types';

import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

const schema = Yup.object({
  email: Yup.string().required(),
});

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const UpdateEmail: React.FC<UpdateEmailProps> = ({
  user,
  allowEmailChange,
}) => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: { email: user.email || '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<UserReturned>;

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t('successfully-updated'));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            {t('email-address')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('email-address-description')}</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="email">{t('email-address')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('your-email')}
              value={formik.values.email}
              onChange={formik.handleChange}
              disabled={!allowEmailChange}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-destructive text-sm">{formik.errors.email}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-end">
          <Button type="submit" disabled={!formik.dirty || !formik.isValid}>
            {formik.isSubmitting && <Loader2 className="animate-spin" />}
            {t('save-changes')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UpdateEmail;
