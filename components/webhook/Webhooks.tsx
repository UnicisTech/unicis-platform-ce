import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { WithLoadingAndError, EmptyState } from '@/components/shared';
import { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

import CreateWebhook from './CreateWebhook';
import EditWebhook from './EditWebhook';
import { Button } from '@/components/shadcn/ui/button';

const Webhooks = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [createWebhookVisible, setCreateWebhookVisible] = useState(false);
  const [updateWebhookVisible, setUpdateWebhookVisible] = useState(false);
  const [endpoint, setEndpoint] = useState<EndpointOut | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(null);

  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(team.slug);

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
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">Webhooks</h2>
            <p className="text-sm text-muted-foreground">
              Webhooks are used to send notifications to your external apps.
            </p>
          </div>
          <Button
            color='primary'
            onClick={() => setCreateWebhookVisible(!createWebhookVisible)}
          >
            {t('add-webhook')}
          </Button>
        </div>

        {webhooks?.length === 0 ? (
          <EmptyState title={t('no-webhook-title')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm table w-full border-b dark:border-border">
              <thead className="bg-muted">
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('url')}</th>
                  <th>{t('created-at')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {webhooks?.map((webhook) => (
                  <tr key={webhook.id}>
                    <td>{webhook.description}</td>
                    <td>{webhook.url}</td>
                    <td>{new Date(webhook.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="flex gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {endpoint && (
          <EditWebhook
            visible={updateWebhookVisible}
            setVisible={setUpdateWebhookVisible}
            team={team}
            endpoint={endpoint}
          />
        )}
      </div>

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
