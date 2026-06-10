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
import { Pencil, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';

// ── Last delivery badge ───────────────────────────────────────────────────────
// MessageStatus: 0=Success, 1=Pending, 2=Fail, 3=Sending
interface LastAttempt {
  timestamp: string;
  status: number;
  responseStatusCode: number;
}

function LastDeliveryCell({ lastAttempt }: { lastAttempt?: LastAttempt | null }) {
  const { t } = useTranslation('common');

  if (!lastAttempt) {
    return (
      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
        {t('webhook-no-deliveries', { defaultValue: 'No deliveries yet' })}
      </span>
    );
  }

  const isSuccess = lastAttempt.status === 0;
  const isPending = lastAttempt.status === 1 || lastAttempt.status === 3;
  const date = new Date(lastAttempt.timestamp);
  const dateLabel = date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {isSuccess ? (
          <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" aria-hidden />
        ) : isPending ? (
          <Clock size={12} className="text-amber-500 flex-shrink-0" aria-hidden />
        ) : (
          <XCircle size={12} className="text-red-500 flex-shrink-0" aria-hidden />
        )}
        <span
          className={`text-[11px] font-medium ${
            isSuccess
              ? 'text-green-700 dark:text-green-400'
              : isPending
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {isSuccess
            ? t('webhook-delivery-success', { defaultValue: 'Success' })
            : isPending
            ? t('webhook-delivery-pending', { defaultValue: 'Pending' })
            : `${t('webhook-delivery-failed', { defaultValue: 'Failed' })} (${lastAttempt.responseStatusCode})`}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">{dateLabel}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type WebhookWithAttempt = EndpointOut & { lastAttempt?: LastAttempt | null };

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
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4">
                      {t('webhook-last-delivery', { defaultValue: 'Last delivery' })}
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(webhooks as WebhookWithAttempt[])?.map((webhook) => (
                    <TableRow key={webhook.id} className="border-slate-100 dark:border-slate-700">
                      <TableCell className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{webhook.description}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 break-all max-w-[200px]">
                        {webhook.url}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {new Date(webhook.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <LastDeliveryCell lastAttempt={webhook.lastAttempt} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEndpoint(webhook);
                              setUpdateWebhookVisible(true);
                            }}
                            aria-label={t('edit')}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setConfirmationDialogVisible(true);
                            }}
                            aria-label={t('remove')}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
