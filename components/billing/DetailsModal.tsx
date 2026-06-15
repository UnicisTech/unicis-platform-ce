import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { defaultHeaders, countries } from '@/lib/common';
import type { Invitation, Team } from 'types';
import type { ApiResponse } from 'types';
import useInvitations from 'hooks/useInvitations';
import type { BillingPeriod } from '@/components/billing/Pricing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

interface DetailsModalProps {
  selectedSubscription: string;
  billingPeriod: BillingPeriod;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  selectedSubscription,
  billingPeriod,
  visible,
  setVisible,
  team,
}) => {
  const { t } = useTranslation('common');
  const { mutateInvitation } = useInvitations(team.slug);

  const formik = useFormik({
    initialValues: {
      companyName: '',
      address: '',
      zipCode: '',
      country: t(`country.${countries[0]}`),
      vatId: '',
      email: '',
    },
    validationSchema: Yup.object({
      companyName: Yup.string().required(t('required')),
      address: Yup.string().required(t('required')),
      zipCode: Yup.string().required(t('required')),
      country: Yup.string().required(t('required')),
      vatId: Yup.string().required(t('required')),
      email: Yup.string().email(t('invalid-email')).required(t('required')),
    }),
    onSubmit: async (values) => {
      const res = await fetch(`/api/teams/${team.slug}/billing`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          subscription: selectedSubscription,
          billingPeriod,
        }),
      });
      const json = (await res.json()) as ApiResponse<Invitation>;
      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t('subscription-request-sent'));
        mutateInvitation();
        setVisible(false);
        formik.resetForm();
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t('request-subscription', {
                subscription: selectedSubscription,
              })}
              <span
                className="rounded-full border px-2 py-0.5 text-xs font-medium
                border-ub-blue-border bg-ub-blue-bg text-ub-blue-text"
              >
                {t(`billing.${billingPeriod}`)}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Company Name */}
            <div className="grid gap-1">
              <Label htmlFor="companyName">{t('company-name')}</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                placeholder={t('company-name')}
              />
              {formik.touched.companyName && formik.errors.companyName && (
                <p className="text-destructive text-sm">
                  {formik.errors.companyName}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="grid gap-1">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                placeholder={t('address')}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-destructive text-sm">
                  {formik.errors.address}
                </p>
              )}
            </div>

            {/* Zip Code */}
            <div className="grid gap-1">
              <Label htmlFor="zipCode">{t('zip-code')}</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formik.values.zipCode}
                onChange={formik.handleChange}
                placeholder={t('zip-code')}
              />
              {formik.touched.zipCode && formik.errors.zipCode && (
                <p className="text-destructive text-sm">
                  {formik.errors.zipCode}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="grid gap-1">
              <Label htmlFor="country">{t('country-label')}</Label>
              <Select
                name="country"
                value={formik.values.country}
                onValueChange={(val) => formik.setFieldValue('country', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select-country')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {t(`country.${country}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.country && formik.errors.country && (
                <p className="text-destructive text-sm">
                  {formik.errors.country}
                </p>
              )}
            </div>

            {/* VAT ID */}
            <div className="grid gap-1">
              <Label htmlFor="vatId">{t('vat-id')}</Label>
              <Input
                id="vatId"
                name="vatId"
                value={formik.values.vatId}
                onChange={formik.handleChange}
                placeholder={t('vat-id')}
              />
              {formik.touched.vatId && formik.errors.vatId && (
                <p className="text-destructive text-sm">
                  {formik.errors.vatId}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-1">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder="email@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-destructive text-sm">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisible(false)}>
              {t('close')}
            </Button>
            <Button
              type="submit"
              className="ml-2"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t('send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
