import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';
import type { Team, Invitation } from '@prisma/client';
import useInvitations from 'hooks/useInvitations';
import type { ApiResponse } from 'types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Loader2 } from 'lucide-react';

interface InviteMemberProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}

const InviteMember: React.FC<InviteMemberProps> = ({
  visible,
  setVisible,
  team,
}) => {
  const { t } = useTranslation('common');
  const { mutateInvitation } = useInvitations(team.slug);

  const formik = useFormik({
    initialValues: {
      email: '',
      role: availableRoles[0].id,
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required(t('require-email')),
      role: Yup.string()
        .oneOf(availableRoles.map((r) => r.id))
        .required(t('required-role')),
    }),
    onSubmit: async (values) => {
      const res = await fetch(`/api/teams/${team.slug}/invitations`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<Invitation>;

      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t('invitation-sent'));
        mutateInvitation();
        setVisible(false);
        formik.resetForm();
      }
    },
  });

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('invite-new-member')}</DialogTitle>
            <DialogDescription>{t('invite-member-message')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Email */}
            <div className="grid gap-1">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@unicis.tech"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="w-full"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-destructive text-sm">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="grid gap-1">
              <Label htmlFor="role">{t('role')}</Label>
              <Select
                name="role"
                value={formik.values.role}
                onValueChange={(val) => formik.setFieldValue('role', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-role')} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <p className="text-destructive text-sm">{formik.errors.role}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisible(false)}>
              {t('close')}
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="ml-2"
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t('send-invite')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMember;
