import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { EmptyState, WithLoadingAndError } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import fetcher from '@/lib/fetcher';
import type { ApiKey, Team } from 'types';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import type { ApiResponse } from 'types';
import NewAPIKey from './NewAPIKey';

interface APIKeysProps {
  team: Team;
}

const APIKeys = ({ team }: APIKeysProps) => {
  const { t } = useTranslation('common');
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { data, isLoading, error, mutate } = useSWR<{ data: ApiKey[] }>(
    `/api/teams/${team.slug}/api-keys`,
    fetcher
  );

  const deleteApiKey = async (apiKey: ApiKey | null) => {
    if (!apiKey) return;

    const res = await fetch(`/api/teams/${team.slug}/api-keys/${apiKey.id}`, {
      method: 'DELETE',
    });

    const { data, error } = (await res.json()) as ApiResponse<null>;

    setSelectedApiKey(null);
    setConfirmationDialogVisible(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      mutate();
      toast.success(t('api-key-deleted'));
    }
  };

  const apiKeys = data?.data ?? [];

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Direction B panel header */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <div>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {t('api-keys')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('api-keys-description')}
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateModalVisible(true)}>
            {t('create-api-key')}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {apiKeys.length === 0 ? (
            <EmptyState
              title={t('no-api-key-title')}
              description={t('no-api-key-description')}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                        {t('name')}
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                        {t('status')}
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                        {t('created')}
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 text-right">
                        {t('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow
                        key={apiKey.id}
                        className="border-slate-100 dark:border-slate-700"
                      >
                        <TableCell className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {apiKey.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge variant="default">{t('active')}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setConfirmationDialogVisible(true);
                            }}
                          >
                            {t('revoke')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ConfirmationDialog
                title={t('revoke-api-key')}
                visible={confirmationDialogVisible}
                onConfirm={() => deleteApiKey(selectedApiKey)}
                onCancel={() => setConfirmationDialogVisible(false)}
                cancelText={t('cancel')}
                confirmText={t('revoke-api-key')}
              >
                {t('revoke-api-key-confirm')}
              </ConfirmationDialog>
            </>
          )}
        </div>
      </div>

      <NewAPIKey
        team={team}
        createModalVisible={createModalVisible}
        setCreateModalVisible={setCreateModalVisible}
      />
    </WithLoadingAndError>
  );
};

export default APIKeys;
