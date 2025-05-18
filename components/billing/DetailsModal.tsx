import { defaultHeaders } from '@/lib/common';
import type { Invitation, Team } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import Modal from '../shared/Modal';
import { InputWithLabel, WithLabel } from '../shared';
import countries from '../defaultLanding/data/configs/countries';
import DaisyButton from '../shared/daisyUI/DaisyButton';

const DetailsModal = ({
  selectedSubscription,
  visible,
  setVisible,
  team,
}: {
  selectedSubscription: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { t } = useTranslation('common');

  // console.log('countries', countries)
  //TODO: #6 check if email exist in teamMembers and its admin or owner
  const formik = useFormik({
    initialValues: {
      companyName: '',
      address: '',
      zipCode: '',
      country: 'Germany',
      vatId: '',
      email: '',
    },
    validationSchema: Yup.object().shape({
      companyName: Yup.string().required(),
      address: Yup.string().required(),
      zipCode: Yup.string().required(),
      country: Yup.string().required('Country is a required field.'),
      vatId: Yup.string().required(),
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      console.log('values', { ...values, subscription: selectedSubscription });
      const response = await fetch(`/api/teams/${team.slug}/billing`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ ...values, subscription: selectedSubscription }),
      });
      console.log('post billing response', response);

      const json = (await response.json()) as ApiResponse<Invitation>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('invitation-sent'));
      // mutateInvitation();
      setVisible(false);
      formik.resetForm();
    },
  });
  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <Modal open={visible} close={toggleVisible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>
          {t('request-subscription', { subscription: selectedSubscription })}
        </Modal.Header>
        {/* <Modal.Description>{t('invite-member-message')}</Modal.Description> */}
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <InputWithLabel
              type="text"
              label={t('company-name')}
              name="companyName"
              value={formik.values.companyName}
              error={
                formik.touched.companyName
                  ? formik.errors.companyName
                  : undefined
              }
              onChange={formik.handleChange}
              required
            />
            <InputWithLabel
              type="text"
              label={t('address')}
              name="address"
              value={formik.values.address}
              error={formik.touched.address ? formik.errors.address : undefined}
              onChange={formik.handleChange}
              required
            />
            <InputWithLabel
              type="text"
              label={t('zip-code')}
              name="zipCode"
              value={formik.values.zipCode}
              error={formik.touched.zipCode ? formik.errors.zipCode : undefined}
              onChange={formik.handleChange}
              required
            />
            <WithLabel
              label={t('countries')}
              error={formik.touched.country ? formik.errors.country : undefined}
            >
              <select
                className="select-bordered select rounded"
                name="country"
                onChange={formik.handleChange}
                value={formik.values.country}
                required
              >
                {countries.map(({ label, value }) => (
                  <option value={label} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </WithLabel>
            <InputWithLabel
              type="text"
              label={t('vat-id')}
              name="vatId"
              value={formik.values.vatId}
              error={formik.touched.vatId ? formik.errors.vatId : undefined}
              onChange={formik.handleChange}
              required
            />
            <InputWithLabel
              type="email"
              label={t('email')}
              name="email"
              // placeholder="first.last@name.com"
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <DaisyButton
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
            size="md"
          >
            {t('close')}
          </DaisyButton>
          <DaisyButton
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            size="md"
          >
            {t('send')}
          </DaisyButton>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default DetailsModal;
