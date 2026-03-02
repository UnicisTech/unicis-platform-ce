import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { Team } from '@/generated/browser';
import type { ApiResponse } from 'types';
import { defaultHeaders } from '@/lib/common';
import useTeams from 'hooks/useTeams';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

interface CreateTeamProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const schema = Yup.object({
  name: Yup.string().required(),
});

const CreateTeam: React.FC<CreateTeamProps> = ({ visible, setVisible }) => {
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();
  const router = useRouter();

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      const res = await fetch('/api/teams/', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as ApiResponse<Team>;

      if (!res.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      mutateTeams();
      setVisible(false);
      toast.success(t('team-created'));
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        setVisible(open);
        if (!open) formik.resetForm();
      }}
    >
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('create-team')}</DialogTitle>
            <DialogDescription>{t('members-of-a-team')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="team-name">{t('name')}</Label>
            <Input
              id="team-name"
              name="name"
              placeholder={t('team-name')}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.name && formik.errors.name)}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-sm">{formik.errors.name}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
            <Button
              type="submit"
              disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
            >
              {formik.isSubmitting && (
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              )}
              {t('create-team')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeam;
