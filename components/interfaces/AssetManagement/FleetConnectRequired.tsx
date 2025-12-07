import React, { ReactNode, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { InputWithLabel, Loading } from '@/components/shared';
import { passwordPolicies } from '@/lib/common';
import { useTranslation } from 'next-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  useCreateFleetAccount,
  useAccessFleetAccount,
} from '@/hooks/fleets/index';
import Cookies from 'js-cookie';
import { User } from '@prisma/client';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';
import { X } from 'lucide-react';

interface FleetConnectRequiredProps {
  user: Partial<User>,
  children: (authProps: {
    isAuthenticated: boolean;
    fleetUser: FleetUser | null;
    hasRole: (role: string) => boolean;
    logout: () => void;
  }) => ReactNode;
}

interface FleetUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

const schema = Yup.object().shape({
  id: Yup.string().required(),
  email: Yup.string().required(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  expiresOn: Yup.string().required(),
  fleetPassword: Yup.string().required().min(passwordPolicies.fleetMinLength),
});

const FleetConnectRequired = ({ user, children }: FleetConnectRequiredProps) => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fleetUser, setFleetUser] = useState<FleetUser | null>(null);

  const createFleetAccount = useCreateFleetAccount();
  const accessFleetAccount = useAccessFleetAccount();
  // const access = undefined
  // const assetsVerificationLoading = undefined
  const { access, isLoading: assetsVerificationLoading } = useVerifyFleetAsses();

  console.log("access", access)

  const formik = useFormik({
    initialValues: {
      email: user.email || '',
      id: user.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fleetPassword: '',
      expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16),
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      if (!values.email || !values.firstName || !values.lastName || !values.fleetPassword || !values.id || !values.expiresOn) {
        console.error('Invalid data from user');
        return;
      }

      try {
        await createFleetAccount(values.id, values.email, values.firstName, values.lastName, values.fleetPassword);
        const { fleet_access } = await accessFleetAccount(values.email, values.fleetPassword);
        Cookies.set('ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA', fleet_access.secret_key, {
          sameSite: 'strict',
        });
        console.log("fleet_access", fleet_access)
        if (fleet_access.secret_key) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error creating or connecting fleet:', error);
      }
    },
  });

  useEffect(() => {
    if (access?.is_active) {
      if (!access?.is_expired && access.is_active) {
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setFleetUser(null);
    }
  }, [access]);

  const logout = () => {
    Cookies.remove('ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA');
    setIsAuthenticated(false);
    setFleetUser(null);
  };

  const hasRole = (role: string) => {
    return fleetUser?.roles.includes(role) ?? false;
  };

  if (assetsVerificationLoading) {
    return <Loading />;
  }

  return (
    <>
      {isAuthenticated && !assetsVerificationLoading ? (
        children({ isAuthenticated, fleetUser, hasRole, logout })
      ) : (
        <div className="hero rounded ring-1 ring-gray-300 min-h-3.5">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold">{t('fleet-connection-required')}</h1>
              <p className="py-6">{t('fleet-connection-prompt')}</p>
              <Button
                variant="default"
                disabled={assetsVerificationLoading}
                onClick={() => setVisible(true)}
                size="sm"
              >
                {t('fleet-connect')}
              </Button>
            </div>
          </div>
        </div>
      )}
  
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{t('fleet-connect-title')}</DialogTitle>
                <X
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setVisible(false)}
                />
              </div>
              <DialogDescription>
                {t('fleet-password-description')}
              </DialogDescription>
            </DialogHeader>
  
            <div className="space-y-4">
              <InputWithLabel
                type="password"
                label={t('fleet-user-password')}
                name="fleetPassword"
                placeholder={t('fleet-password')}
                value={formik.values.fleetPassword}
                error={formik.touched.fleetPassword ? formik.errors.fleetPassword : undefined}
                onChange={formik.handleChange}
                required
              />
              <InputWithLabel
                type="datetime-local"
                label={t('access-end-day')}
                name="expiresOn"
                value={formik.values.expiresOn}
                error={formik.touched.expiresOn ? formik.errors.expiresOn : undefined}
                onChange={formik.handleChange}
              />
            </div>
  
            <DialogFooter>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? t('connecting') : t('fleet-connect')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setVisible(false)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetConnectRequired;
