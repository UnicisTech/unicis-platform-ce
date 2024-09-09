import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Error, Loading, PlatformBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import { WithLoadingAndError } from '@/components/shared';
import type { Team, FleetSecret as FSType, FleetAccount } from '@prisma/client';
import { CreatePack, DeletePack, EditPack } from '@/components/interfaces/Pack';
import { usePacks } from '@/hooks/fleets/packs/usePack';
import { Pack } from '@/types/fleet';
import { PLATFORMS } from '@/lib/fleet/constants';
import { getFleetSecret } from '@/hooks/fleets/useFleetSecret';
import FleetStatus from '../Fleet/FleetStatus';
import { useGetPackId } from '@/hooks/fleets/packs/useGetPackId';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import ReactQuill from 'react-quill';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';


interface Option {
  label: string;
  value: string;
}

const PackDetails = ({ teamId, fleetAccount, packID }: { teamId: string, fleetAccount: Partial<FleetAccount>, packID: string }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [visible, setVisible] = useState(false);
  
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [fleetTeam, setfleetTeam] = useState<Partial<FSType> | null>(null);
  const [secretLoading, setIsLoading] = useState(true);
  const [secretError, setIsError] = useState<string | null>(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  
  useEffect(() => {
    const fetchSecret = async () => {
      try {
        const secret = await getFleetSecret(teamId);
        setfleetTeam(secret);
      } catch (error) {
        setIsError('error.message');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSecret();
  }, [teamId]);

  const { pack, isLoading, isError } = useGetPackId(fleetTeam?.fleetTeamId!, fleetAccount?.accessPhrase!, packID);

  if (isLoading || secretLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <FleetStatus />
        {/* <Error /> */}
      </>
    );
  }

  return (
    <IssuePanelContainer>
      {/* <Form<FormData>
        onSubmit={async (data) => {
          
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                margin: '0 auto',
                flexDirection: 'column',
              }}
            >
                <Field
                  aria-required={true}
                  name="name"
                  label="Name"
                  isRequired
                  defaultValue={pack?.name}
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <TextField autoComplete="off" {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                
                <Field<ValueType<Option>>
                  name="platform"
                  label="Platform"
                  aria-required={true}
                  isRequired
                  defaultValue={PLATFORMS.find(
                    ({ value }) => value === pack?.platform
                  )}
                  validate={async (value) => {
                    if (value) {
                      return undefined;
                    }

                    return new Promise((resolve) =>
                      setTimeout(resolve, 300)
                    ).then(() => 'Please select a platform');
                  }}
                >
                  {({ fieldProps: { id, ...rest }, error }) => (
                    <Fragment>
                      <WithoutRing>
                        <Select
                          inputId={id}
                          {...rest}
                          options={PLATFORMS}
                          validationState={error ? 'error' : 'default'}
                        />
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </WithoutRing>
                    </Fragment>
                  )}
                </Field>

                <div className='grid grid-cols-2 gap-2'>
                  <Field
                    aria-required={true}
                    name="version"
                    label="Version"
                    isRequired
                    defaultValue={pack?.version}
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>

                  <Field
                    aria-required={true}
                    name="shard"
                    label="Shard"
                    isRequired
                    defaultValue={pack?.shard}
                  >
                    {({ fieldProps }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                      </Fragment>
                    )}
                  </Field>
                </div>

                <Field
                  label="Description"
                  name="description"
                  defaultValue={pack?.description || ''}
                >
                  {({ fieldProps }: any) => (
                    <Fragment>
                      <ReactQuill
                        theme="snow"
                        {...fieldProps}
                        onChange={(value) => {
                          checkFormChanges();
                          fieldProps.onChange(value);
                        }}
                      />
                    </Fragment>
                  )}
                </Field>
                <FormFooter></FormFooter>
            </div>
          </form>
        )}
      </Form> */}
    </IssuePanelContainer>
  );
};

export default PackDetails;
