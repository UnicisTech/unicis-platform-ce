// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

import React, { ReactNode, useEffect, useState } from 'react';
import { Modal, Button } from 'react-daisyui';
import Form from '@atlaskit/form';
import { passwordPolicies } from '@/lib/common';
import { useTranslation } from 'react-i18next';
import { InputWithLabel, Loading } from '@/components/shared';
import { Icon } from '@iconify/react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
    useCreateFleetAccount,
    useAccessFleetAccount,
} from '@/hooks/fleets/index';
import Cookies from 'js-cookie';
import { User } from '@prisma/client';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';


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

interface JwtPayload {
    exp?: number;
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
    const { access, isLoading: assetsVerificationLoading, isError: assesVerificationError } = useVerifyFleetAsses();

    const formik = useFormik({
        initialValues: { email: user.email, id: user.id, firstName: user.firstName, lastName: user.lastName, fleetPassword: '', expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24).toTimeString() },
        validationSchema: schema,
        onSubmit: async (values) => {
            console.log("values", values)
            if (!values.email || !values.firstName || !values.lastName || !values.fleetPassword || !values.id || !values.expiresOn) {
                console.error('Invalid data from user');
                return;
            }

            try {
                await createFleetAccount(values.id, values.email, values.firstName, values.lastName, values.fleetPassword);
                const { user, fleet_access } = await accessFleetAccount(values.email, values.fleetPassword);
                Cookies.set('ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA', fleet_access.secret_key, {
                    sameSite: 'strict',
                });
                if (fleet_access.secret_key) {
                    setIsAuthenticated(true);
                }
                // TODO: I ma do more processing here later
            } catch (error) {
                console.error('Error creating or connecting fleet:', error);
            }
        },
    });

    useEffect(() => {
        if (access?.is_active) {
            try {
                if (!access?.is_expired && access.is_active) {
                    setIsAuthenticated(true);
                } else {
                    logout();
                }
            } catch (error) {
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
                            <h1 className="text-2xl font-bold">Fleet Connection Is Required</h1>
                            <p className="py-6">Please connect to Fleet API to continue.</p>
                            <Button color="neutral" loading={assetsVerificationLoading} onClick={() => setVisible(!visible)} size="md">
                                {t('fleet-connect')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {!isAuthenticated && !assetsVerificationLoading &&
                <Modal open={!isAuthenticated && !visible && !assetsVerificationLoading}>
                    <Form<FormData> onSubmit={(data) => formik.handleSubmit()}>
                        {({ formProps }) => (
                            <form {...formProps}>
                                <div className="flex w-full justify-between">
                                    <Modal.Header>{t('Fleet Connect')}</Modal.Header>
                                    <Icon icon="ic:round-close" onClick={() => setVisible(!visible)} />
                                </div>
                                <Modal.Body>
                                    <InputWithLabel
                                        type="password"
                                        label={t('fleet-user-password')}
                                        name="fleetPassword"
                                        required={true}
                                        placeholder={t('fleet-password')}
                                        value={formik.values.fleetPassword}
                                        error={formik.touched.fleetPassword ? formik.errors.fleetPassword : undefined}
                                        onChange={formik.handleChange}
                                    />
                                    <InputWithLabel
                                        type="datetime-local"
                                        label={t('Access End Day (Default to 90 day) Max 180 days')}
                                        name="expiresOn"
                                        aria-autocomplete='none'
                                        className='w-full'
                                        defaultValue={new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toTimeString()}
                                        value={formik.values.expiresOn}
                                        error={formik.touched.expiresOn ? formik.errors.expiresOn : undefined}
                                        onChange={formik.handleChange}
                                    />
                                    <span className="text-xs">{t('fleet-password-description')}</span>
                                </Modal.Body>
                                <Modal.Actions>
                                    <Button type="submit">{t('fleet-connect')}</Button>
                                </Modal.Actions>
                            </form>
                        )}
                    </Form>
                </Modal>
            }
        </>
    );
};

export default FleetConnectRequired;
