import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { WithLoadingAndError, EmptyState } from '@/components/shared';
import type { Team } from 'types';
import useWebhooks from 'hooks/useWebhooks';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import CreateWebhook from './CreateWebhook';
import EditWebhook from './EditWebhook';
import { Button } from '@/components/shadcn/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';

const Webhooks = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [createWebhookVisible, setCreateWebhookVisible] = useState(false);
  const [updateWebhookVisible, setUpdateWebhookVisible] = useState(false);
  const [endpoint, setEndpoint] = useState<EndpointOut | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(
    null
  );

  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(
    team.slug
  );

  const deleteWebhook = async (webhook: EndpointOut | null) => {
    if (!webhook) return;

    const sp = new URLSearchParams({ webhookId: webhook.id });

    const response = await fetch(
      `/api/teams/${team.slug}/webhooks?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateWebhooks();
    toast.success(t('webhook-deleted'));
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Direction B panel header */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <div>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {t('webhooks')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('webhooks-description')}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setCreateWebhookVisible(!createWebhookVisible)}
          >
            {t('add-webhook')}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {webhooks?.length === 0 ? (
            <EmptyState title={t('no-webhook-title')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">{t('name')}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">{t('url')}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">{t('created-at')}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks?.map((webhook) => (
                    <TableRow key={webhook.id} className="border-slate-100 dark:border-slate-700">
                      <TableCell className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{webhook.description}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 break-all max-w-[260px]">
                        {webhook.url}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(webhook.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEndpoint(webhook);
                              setUpdateWebhookVisible(true);
                            }}
                          >
                            {t('edit')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setConfirmationDialogVisible(true);
                            }}
                          >
                            {t('remove')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {endpoint && (
        <EditWebhook
          visible={updateWebhookVisible}
          setVisible={setUpdateWebhookVisible}
          team={team}
          endpoint={endpoint}
        />
      )}

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => deleteWebhook(selectedWebhook)}
        title={t('confirm-delete-webhook')}
      >
        {t('delete-webhook-warning')}
      </ConfirmationDialog>

      <CreateWebhook
        visible={createWebhookVisible}
        setVisible={setCreateWebhookVisible}
        team={team}
      />
    </WithLoadingAndError>
  );
};

export default Webhooks;
