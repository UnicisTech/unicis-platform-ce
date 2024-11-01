import { Fragment, useCallback, useState } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import type { User } from '@prisma/client';
import { PLATFORMS } from '@/lib/fleet/constants';
import { IssuePanelContainer, WithoutRing } from '@/sharedStyles';
import Form, { ErrorMessage, Field, FormFooter } from '@atlaskit/form';
import Select, { ValueType } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import toast from 'react-hot-toast';
import DeleteQuery from './DeleteDistributorResult';
import { useUpdateQuery } from '@/hooks/fleets/querys/useUpdateQuery';
import { useGetDistributedIdResult } from '@/hooks/fleets/distributors/useGetDistributorIdResult';
import { CodeBlock } from '@atlaskit/code';
import FormattedDate from '@/components/shared/Date';
import StatusValue from '../StatusValue';

interface FormData {
  name,
  platform: ValueType<Option>,
  version,
  shard,
  description,
  [key: string]: string | ValueType<Option>;
}

interface Option {
  label: string;
  value: string;
}

const DistributorsDetails = ({ user, distributorId, fleetTeamId }: { user: Partial<User>, distributorId: string, fleetTeamId: string }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [status, setStatus] = useState<'new' | 'pending' | 'complete' | 'failed'>('new');
  const [isFormChanged, setIsFormChanged] = useState(false);
  const updateQuery = useUpdateQuery();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  const checkFormChanges = useCallback(() => {
    setIsFormChanged(true);
  }, []);
  

  const { distributorsResult, isLoading, isError } = useGetDistributedIdResult(fleetTeamId, distributorId, status, user.fleetAccessPhrase!);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <Error />
      </>
    );
  }

  const openDeleteModal = async (id: string) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <IssuePanelContainer>
      <div className='grid gap-2 text-black'>
        <span className="flex items-center gap-2 bg-blue-200 rounded-badge px-2">ID: {distributorsResult?.distributed_id}</span>
        <div className="bg-gray-700 rounded-xs">
          {distributorsResult?.query.id}
          <span className="ml-2">Team: {distributorsResult?.query.team.id}</span>
          <span className="ml-2">Shard: {distributorsResult?.query.shard}</span>
          <span className="ml-2">Created At: <FormattedDate style={``} dateString={distributorsResult?.query.created_at} /></span>
        </div>
        <div className="items-center justify-start">
          <CodeBlock language="sql" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={distributorsResult?.query.sql!} />
        </div>
        {distributorsResult?.tasks.map((task) => 
          <div key={task.id} className='grid grid-cols-1 gap-2'>
              {task?.results.map((result, index) => 
                <div key={result.id} className='grid p-2 rounded-md bg-gray-100 gap-1'>
                  <div className='bg-blue-200 rounded-badge px-2'>ID: {result.id}</div>
                  <div className='overflow-x-auto'>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.columns).map(([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className='flex items-center gap-2 bg-blue-200 rounded-badge px-2'>Timestamp: <FormattedDate style={``} dateString={result.timestamp} /></div>
                  <div className='flex items-center gap-2 bg-blue-200 rounded-badge px-2'>Created At: <FormattedDate style={``} dateString={result.created_at} /></div>
                  <div className='flex items-center gap-2 bg-blue-200 rounded-badge px-2'>Updated At: <FormattedDate style={``} dateString={result.updated_at} /></div>
                </div>
              )}
          </div>
        )}
      </div>
      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        distributorId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default DistributorsDetails;
