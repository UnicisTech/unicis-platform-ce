import { EmptyState, Loading } from '@/components/shared';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import { Separator } from '@/components/shadcn/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { copyToClipboard } from '@/lib/common';
import fetcher from '@/lib/fetcher';
import type { OIDCSSORecord, SAMLSSORecord } from '@boxyhq/saml-jackson';
import {
  Copy,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import type { Team } from 'types';

type ConnectionKind = 'saml' | 'oidc';

type SAMLConnection = SAMLSSORecord & {
  rawMetadata?: string;
  metadataUrl?: string;
  acsUrlOverride?: string;
};

type OIDCConnection = OIDCSSORecord;

type SSOConnectionRecord = (SAMLConnection | OIDCConnection) & {
  isSystemSSO?: boolean;
};

type BaseFormValues = {
  name: string;
  label: string;
  description: string;
  redirectUrl: string[];
  defaultRedirectUrl: string;
  sortOrder: string;
};

type SAMLFormValues = BaseFormValues & {
  rawMetadata: string;
  metadataUrl: string;
  forceAuthn: boolean;
  acsUrlOverride: string;
  clientID?: string;
  clientSecret?: string;
};

type OIDCFormValues = BaseFormValues & {
  oidcClientId: string;
  oidcClientSecret: string;
  oidcDiscoveryUrl: string;
  oidcMetadata: {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
    userinfo_endpoint: string;
  };
  clientID?: string;
  clientSecret?: string;
};

interface SSOConnectionsProps {
  team: Team;
  spMetadataUrl: string;
}

const baseInitialValues: BaseFormValues = {
  name: '',
  label: '',
  description: '',
  redirectUrl: [''],
  defaultRedirectUrl: '',
  sortOrder: '',
};

const initialSamlValues: SAMLFormValues = {
  ...baseInitialValues,
  rawMetadata: '',
  metadataUrl: '',
  forceAuthn: false,
  acsUrlOverride: '',
};

const initialOidcValues: OIDCFormValues = {
  ...baseInitialValues,
  oidcClientId: '',
  oidcClientSecret: '',
  oidcDiscoveryUrl: '',
  oidcMetadata: {
    issuer: '',
    authorization_endpoint: '',
    token_endpoint: '',
    jwks_uri: '',
    userinfo_endpoint: '',
  },
};

const isSAMLConnection = (
  connection: SSOConnectionRecord
): connection is SAMLConnection => 'idpMetadata' in connection;

const normalizeRedirectUrls = (value?: string[] | string): string[] => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : [''];
  }

  if (!value) {
    return [''];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed : [''];
    }
  } catch {
    // Some Jackson records store redirectUrl as a plain URL string.
  }

  return [value];
};

const redirectUrlsPayload = (urls: string[]) => {
  const filtered = urls.map((url) => url.trim()).filter(Boolean);
  return JSON.stringify(filtered.length > 0 ? filtered : ['']);
};

const sortOrderPayload = (value: string) => {
  if (value.trim() === '') {
    return undefined;
  }

  return Number(value);
};

const encodeRawMetadata = (value: string) => {
  if (!value) {
    return '';
  }

  return window.btoa(value);
};

const requestSSO = async <T,>(url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Something went wrong');
  }

  return data as T;
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Something went wrong';
};

const providerName = (
  connection: SSOConnectionRecord,
  fallback = 'Unknown'
) => {
  if (isSAMLConnection(connection)) {
    return (
      connection.idpMetadata?.friendlyProviderName ||
      connection.idpMetadata?.provider ||
      connection.name ||
      fallback
    );
  }

  return (
    connection.oidcProvider?.friendlyProviderName ||
    connection.oidcProvider?.provider ||
    connection.name ||
    fallback
  );
};

const connectionType = (connection: SSOConnectionRecord): ConnectionKind =>
  isSAMLConnection(connection) ? 'saml' : 'oidc';

const baseValuesFromConnection = (
  connection: SSOConnectionRecord
): BaseFormValues => ({
  name: connection.name || '',
  label: connection.label || '',
  description: connection.description || '',
  redirectUrl: normalizeRedirectUrls(connection.redirectUrl),
  defaultRedirectUrl: connection.defaultRedirectUrl || '',
  sortOrder:
    connection.sortOrder === null || connection.sortOrder === undefined
      ? ''
      : String(connection.sortOrder),
});

const samlValuesFromConnection = (
  connection?: SAMLConnection
): SAMLFormValues => {
  if (!connection) {
    return initialSamlValues;
  }

  return {
    ...baseValuesFromConnection(connection),
    rawMetadata: connection.rawMetadata || '',
    metadataUrl: connection.metadataUrl || '',
    forceAuthn:
      connection.forceAuthn === true || connection.forceAuthn === 'true',
    acsUrlOverride: connection.acsUrlOverride || '',
    clientID: connection.clientID,
    clientSecret: connection.clientSecret,
  };
};

const oidcValuesFromConnection = (
  connection?: OIDCConnection
): OIDCFormValues => {
  if (!connection) {
    return initialOidcValues;
  }

  return {
    ...baseValuesFromConnection(connection),
    oidcClientId: connection.oidcProvider?.clientId || '',
    oidcClientSecret: connection.oidcProvider?.clientSecret || '',
    oidcDiscoveryUrl: connection.oidcProvider?.discoveryUrl || '',
    oidcMetadata: {
      issuer: String(connection.oidcProvider?.metadata?.issuer || ''),
      authorization_endpoint: String(
        connection.oidcProvider?.metadata?.authorization_endpoint || ''
      ),
      token_endpoint: String(
        connection.oidcProvider?.metadata?.token_endpoint || ''
      ),
      jwks_uri: String(connection.oidcProvider?.metadata?.jwks_uri || ''),
      userinfo_endpoint: String(
        connection.oidcProvider?.metadata?.userinfo_endpoint || ''
      ),
    },
    clientID: connection.clientID,
    clientSecret: connection.clientSecret,
  };
};

export default function SSOConnections({
  team,
  spMetadataUrl,
}: SSOConnectionsProps) {
  const { t } = useTranslation('common');
  const connectionsUrl = `/api/teams/${team.slug}/sso`;
  const { data, error, isLoading, mutate } = useSWR<SSOConnectionRecord[]>(
    connectionsUrl,
    fetcher
  );
  const [connectionDialog, setConnectionDialog] = useState<{
    mode: 'create' | 'edit';
    kind: ConnectionKind;
    connection?: SSOConnectionRecord;
  } | null>(null);
  const [metadataConnection, setMetadataConnection] =
    useState<SSOConnectionRecord | null>(null);
  const [deleteConnection, setDeleteConnection] =
    useState<SSOConnectionRecord | null>(null);
  const [statusConnection, setStatusConnection] =
    useState<SSOConnectionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const connections = data ?? [];

  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) => {
      const aOrder = a.sortOrder ?? 0;
      const bOrder = b.sortOrder ?? 0;
      return bOrder - aOrder;
    });
  }, [connections]);

  const handleDelete = async () => {
    if (!deleteConnection) {
      return;
    }

    setIsDeleting(true);

    try {
      const params = new URLSearchParams({
        clientID: deleteConnection.clientID,
        clientSecret: deleteConnection.clientSecret,
      });

      await requestSSO<undefined>(`${connectionsUrl}?${params}`, {
        method: 'DELETE',
      });
      await mutate();
      setDeleteConnection(null);
      toast.success(t('sso.connection-deleted'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConnection) {
      return;
    }

    setIsTogglingStatus(true);

    try {
      await requestSSO<undefined>(connectionsUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientID: statusConnection.clientID,
          clientSecret: statusConnection.clientSecret,
          tenant: statusConnection.tenant,
          product: statusConnection.product,
          deactivated: !statusConnection.deactivated,
          ...(isSAMLConnection(statusConnection)
            ? { isSAML: true }
            : { isOIDC: true }),
        }),
      });
      await mutate();
      toast.success(
        statusConnection.deactivated
          ? t('sso.connection-activated')
          : t('sso.connection-deactivated')
      );
      setStatusConnection(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('sso.manage-title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('sso.manage-description')}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <a href={spMetadataUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t('sso.access-sp-metadata')}
            </a>
          </Button>
          <Button
            onClick={() =>
              setConnectionDialog({ mode: 'create', kind: 'saml' })
            }
          >
            <Plus className="h-4 w-4" />
            {t('sso.new-connection')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </p>
      ) : sortedConnections.length === 0 ? (
        <EmptyState
          title={t('sso.no-connections-title')}
          description={t('sso.no-connections-description')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('sso.provider')}</TableHead>
              <TableHead>{t('sso.type')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConnections.map((connection) => (
              <TableRow key={connection.clientID}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {providerName(connection, t('sso.unknown-provider'))}
                    </div>
                    {(connection.name || connection.label) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {connection.name || connection.label}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {connectionType(connection) === 'saml'
                      ? t('sso.saml')
                      : t('sso.oidc')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={connection.deactivated ? 'secondary' : 'default'}
                  >
                    {connection.deactivated ? t('inactive') : t('active')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('actions')}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          setConnectionDialog({
                            mode: 'edit',
                            kind: connectionType(connection),
                            connection,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setMetadataConnection(connection)}
                      >
                        <Eye className="h-4 w-4" />
                        {t('sso.view-metadata')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setStatusConnection(connection)}
                      >
                        <Power className="h-4 w-4" />
                        {connection.deactivated ? t('enable') : t('disable')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteConnection(connection)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {connectionDialog && (
        <ConnectionDialog
          key={`${connectionDialog.mode}-${connectionDialog.kind}-${
            connectionDialog.connection?.clientID || 'new'
          }`}
          open={Boolean(connectionDialog)}
          mode={connectionDialog.mode}
          kind={connectionDialog.kind}
          connection={connectionDialog.connection}
          url={connectionsUrl}
          onOpenChange={(open) => {
            if (!open) {
              setConnectionDialog(null);
            }
          }}
          onSaved={async (operation, kind) => {
            await mutate();
            setConnectionDialog(null);
            const typeLabel = kind === 'saml' ? t('sso.saml') : t('sso.oidc');
            toast.success(
              operation === 'create'
                ? t('sso.connection-created', { type: typeLabel })
                : t('sso.connection-updated', { type: typeLabel })
            );
          }}
        />
      )}

      <MetadataDialog
        connection={metadataConnection}
        open={Boolean(metadataConnection)}
        onOpenChange={(open) => {
          if (!open) {
            setMetadataConnection(null);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteConnection)}
        title={t('sso.delete-title')}
        description={t('sso.delete-description', {
          provider: deleteConnection
            ? providerName(deleteConnection, t('sso.unknown-provider'))
            : '',
        })}
        confirmText={t('delete')}
        isSubmitting={isDeleting}
        destructive
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConnection(null);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(statusConnection)}
        title={
          statusConnection?.deactivated
            ? t('sso.activate-title')
            : t('sso.deactivate-title')
        }
        description={
          statusConnection?.deactivated
            ? t('sso.activate-description')
            : t('sso.deactivate-description')
        }
        confirmText={statusConnection?.deactivated ? t('enable') : t('disable')}
        isSubmitting={isTogglingStatus}
        destructive={!statusConnection?.deactivated}
        onConfirm={handleToggleStatus}
        onOpenChange={(open) => {
          if (!open) {
            setStatusConnection(null);
          }
        }}
      />
    </div>
  );
}

function ConnectionDialog({
  open,
  mode,
  kind,
  connection,
  url,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  kind: ConnectionKind;
  connection?: SSOConnectionRecord;
  url: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (operation: 'create' | 'update', kind: ConnectionKind) => void;
}) {
  const { t } = useTranslation('common');
  const [connectionKind, setConnectionKind] = useState<ConnectionKind>(kind);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const connectionDetailsUrl =
    mode === 'edit' && connection
      ? `${url}?${new URLSearchParams({ clientID: connection.clientID })}`
      : null;
  const { data: connectionDetails, isLoading: isConnectionLoading } = useSWR<
    SSOConnectionRecord[]
  >(connectionDetailsUrl, fetcher);
  const currentConnection = connectionDetails?.[0] ?? connection;

  useEffect(() => {
    setConnectionKind(kind);
  }, [kind]);

  const title = mode === 'create' ? t('sso.create-title') : t('sso.edit-title');

  const description =
    mode === 'create' ? t('sso.create-description') : t('sso.edit-description');

  const saveSAML = async (values: SAMLFormValues) => {
    setIsSubmitting(true);
    const rawMetadata = values.rawMetadata.trim();
    const metadataUrl = values.metadataUrl.trim();
    const body = {
      clientID: values.clientID,
      clientSecret: values.clientSecret,
      name: values.name,
      label: values.label,
      description: values.description,
      defaultRedirectUrl: values.defaultRedirectUrl,
      redirectUrl: redirectUrlsPayload(values.redirectUrl),
      forceAuthn: values.forceAuthn,
      sortOrder: sortOrderPayload(values.sortOrder),
      acsUrlOverride: values.acsUrlOverride,
      isSAML: mode === 'edit' ? true : undefined,
      encodedRawMetadata:
        mode === 'create' || rawMetadata
          ? encodeRawMetadata(values.rawMetadata)
          : undefined,
      metadataUrl:
        rawMetadata || (mode === 'edit' && !metadataUrl)
          ? undefined
          : values.metadataUrl,
    };

    try {
      await requestSSO<SAMLSSORecord | undefined>(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      onSaved(mode === 'create' ? 'create' : 'update', 'saml');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveOIDC = async (values: OIDCFormValues) => {
    setIsSubmitting(true);
    const oidcDiscoveryUrl = values.oidcDiscoveryUrl.trim();

    try {
      await requestSSO<OIDCSSORecord | undefined>(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientID: values.clientID,
          clientSecret: values.clientSecret,
          name: values.name,
          label: values.label,
          description: values.description,
          defaultRedirectUrl: values.defaultRedirectUrl,
          redirectUrl: redirectUrlsPayload(values.redirectUrl),
          oidcClientId: values.oidcClientId,
          oidcClientSecret: values.oidcClientSecret,
          oidcDiscoveryUrl: oidcDiscoveryUrl || undefined,
          oidcMetadata: oidcDiscoveryUrl ? undefined : values.oidcMetadata,
          sortOrder: sortOrderPayload(values.sortOrder),
          isOIDC: mode === 'edit' ? true : undefined,
        }),
      });
      onSaved(mode === 'create' ? 'create' : 'update', 'oidc');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const samlConnection =
    currentConnection && isSAMLConnection(currentConnection)
      ? currentConnection
      : undefined;
  const oidcConnection =
    currentConnection && !isSAMLConnection(currentConnection)
      ? currentConnection
      : undefined;
  const samlInitialValues = useMemo(
    () => samlValuesFromConnection(samlConnection),
    [samlConnection]
  );
  const oidcInitialValues = useMemo(
    () => oidcValuesFromConnection(oidcConnection),
    [oidcConnection]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === 'create' && (
          <div className="space-y-2">
            <Label>{t('sso.select-type')}</Label>
            <RadioGroup
              value={connectionKind}
              onValueChange={(value) =>
                setConnectionKind(value as ConnectionKind)
              }
              className="grid grid-cols-2 gap-2"
            >
              <RadioOption
                id="sso-type-saml"
                value="saml"
                label={t('sso.saml')}
              />
              <RadioOption
                id="sso-type-oidc"
                value="oidc"
                label={t('sso.oidc')}
              />
            </RadioGroup>
          </div>
        )}

        {isConnectionLoading ? (
          <Loading />
        ) : connectionKind === 'saml' ? (
          <SAMLConnectionForm
            initialValues={samlInitialValues}
            mode={mode}
            isSubmitting={isSubmitting}
            hasExistingMetadata={Boolean(samlConnection?.idpMetadata)}
            onCancel={() => onOpenChange(false)}
            onSubmit={saveSAML}
          />
        ) : (
          <OIDCConnectionForm
            initialValues={oidcInitialValues}
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={saveOIDC}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SAMLConnectionForm({
  initialValues,
  mode,
  isSubmitting,
  hasExistingMetadata,
  onCancel,
  onSubmit,
}: {
  initialValues: SAMLFormValues;
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  hasExistingMetadata: boolean;
  onCancel: () => void;
  onSubmit: (values: SAMLFormValues) => void;
}) {
  const { t } = useTranslation('common');
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormSectionTitle>{t('sso.saml-provider-metadata')}</FormSectionTitle>
      {mode === 'edit' && hasExistingMetadata && (
        <p className="rounded-md border bg-slate-100/60 dark:bg-slate-700/60 p-3 text-sm text-slate-500 dark:text-slate-400">
          {t('sso.raw-idp-xml-edit-note')}
        </p>
      )}
      <Field
        htmlFor="rawMetadata"
        label={t('sso.raw-idp-xml')}
        description={t('sso.raw-idp-xml-description')}
        required={!hasExistingMetadata && values.metadataUrl.trim() === ''}
      >
        <Textarea
          id="rawMetadata"
          value={values.rawMetadata}
          onChange={(event) =>
            setValues({ ...values, rawMetadata: event.target.value })
          }
          placeholder={
            mode === 'edit' && hasExistingMetadata
              ? t('sso.raw-idp-xml-edit-placeholder')
              : t('sso.raw-idp-xml-placeholder')
          }
          required={!hasExistingMetadata && values.metadataUrl.trim() === ''}
          className="min-h-32 font-mono text-xs"
        />
      </Field>

      <SeparatorWithText>{t('sso.or')}</SeparatorWithText>

      <Field
        htmlFor="metadataUrl"
        label={t('metadata-url')}
        description={t('sso.metadata-url-description')}
        required={!hasExistingMetadata && values.rawMetadata.trim() === ''}
      >
        <Input
          id="metadataUrl"
          type="url"
          value={values.metadataUrl}
          onChange={(event) =>
            setValues({ ...values, metadataUrl: event.target.value })
          }
          placeholder={t('sso.metadata-url-placeholder')}
          required={!hasExistingMetadata && values.rawMetadata.trim() === ''}
        />
      </Field>

      <AdvancedSettings>
        <BaseConnectionFields values={values} onChange={setValues} />
        <Field htmlFor="acsUrlOverride" label={t('sso.acs-url-override')}>
          <Input
            id="acsUrlOverride"
            type="url"
            value={values.acsUrlOverride}
            onChange={(event) =>
              setValues({ ...values, acsUrlOverride: event.target.value })
            }
            placeholder="https://yourcompany.com/app/saml/acs"
          />
        </Field>
        <div className="flex items-center gap-2">
          <Checkbox
            id="forceAuthn"
            checked={values.forceAuthn}
            onCheckedChange={(checked) =>
              setValues({ ...values, forceAuthn: checked === true })
            }
          />
          <Label htmlFor="forceAuthn">{t('sso.force-authentication')}</Label>
        </div>
      </AdvancedSettings>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('sso.saving')
            : mode === 'create'
              ? t('sso.create-connection')
              : t('save')}
        </Button>
      </DialogFooter>
    </form>
  );
}

function OIDCConnectionForm({
  initialValues,
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  initialValues: OIDCFormValues;
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: OIDCFormValues) => void;
}) {
  const { t } = useTranslation('common');
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const updateMetadata = (
    field: keyof OIDCFormValues['oidcMetadata'],
    value: string
  ) => {
    setValues({
      ...values,
      oidcMetadata: {
        ...values.oidcMetadata,
        [field]: value,
      },
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormSectionTitle>{t('sso.oidc-provider-credentials')}</FormSectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          htmlFor="oidcClientId"
          label={
            mode === 'edit'
              ? t('sso.oidc-provider-client-id')
              : t('sso.client-id')
          }
          required={mode === 'create'}
        >
          <Input
            id="oidcClientId"
            value={values.oidcClientId}
            onChange={(event) =>
              setValues({ ...values, oidcClientId: event.target.value })
            }
            readOnly={mode === 'edit'}
            required={mode === 'create'}
          />
        </Field>
        <Field
          htmlFor="oidcClientSecret"
          label={
            mode === 'edit'
              ? t('sso.oidc-provider-client-secret')
              : t('sso.client-secret')
          }
          required
        >
          <Input
            id="oidcClientSecret"
            type="password"
            value={values.oidcClientSecret}
            onChange={(event) =>
              setValues({ ...values, oidcClientSecret: event.target.value })
            }
            required
          />
        </Field>
      </div>

      <FormSectionTitle>{t('sso.oidc-provider-metadata')}</FormSectionTitle>
      <Field
        htmlFor="oidcDiscoveryUrl"
        label={t('sso.well-known-url')}
        description={t('sso.well-known-url-description')}
      >
        <Input
          id="oidcDiscoveryUrl"
          type="url"
          value={values.oidcDiscoveryUrl}
          onChange={(event) =>
            setValues({ ...values, oidcDiscoveryUrl: event.target.value })
          }
          placeholder="https://example.com/.well-known/openid-configuration"
        />
      </Field>

      <SeparatorWithText>{t('sso.or')}</SeparatorWithText>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="oidcMetadataIssuer" label={t('sso.issuer')}>
          <Input
            id="oidcMetadataIssuer"
            value={values.oidcMetadata.issuer}
            onChange={(event) => updateMetadata('issuer', event.target.value)}
            placeholder="https://example.com"
          />
        </Field>
        <Field
          htmlFor="oidcMetadataAuthorizationEndpoint"
          label={t('sso.authorization-endpoint')}
        >
          <Input
            id="oidcMetadataAuthorizationEndpoint"
            type="url"
            value={values.oidcMetadata.authorization_endpoint}
            onChange={(event) =>
              updateMetadata('authorization_endpoint', event.target.value)
            }
            placeholder="https://example.com/oauth/authorize"
          />
        </Field>
        <Field
          htmlFor="oidcMetadataTokenEndpoint"
          label={t('sso.token-endpoint')}
        >
          <Input
            id="oidcMetadataTokenEndpoint"
            type="url"
            value={values.oidcMetadata.token_endpoint}
            onChange={(event) =>
              updateMetadata('token_endpoint', event.target.value)
            }
            placeholder="https://example.com/oauth/token"
          />
        </Field>
        <Field htmlFor="oidcMetadataJwksUri" label={t('sso.jwks-uri')}>
          <Input
            id="oidcMetadataJwksUri"
            type="url"
            value={values.oidcMetadata.jwks_uri}
            onChange={(event) => updateMetadata('jwks_uri', event.target.value)}
            placeholder="https://example.com/.well-known/jwks.json"
          />
        </Field>
        <Field
          htmlFor="oidcMetadataUserinfoEndpoint"
          label={t('sso.userinfo-endpoint')}
        >
          <Input
            id="oidcMetadataUserinfoEndpoint"
            type="url"
            value={values.oidcMetadata.userinfo_endpoint}
            onChange={(event) =>
              updateMetadata('userinfo_endpoint', event.target.value)
            }
            placeholder="https://example.com/userinfo"
          />
        </Field>
      </div>

      <AdvancedSettings>
        <BaseConnectionFields values={values} onChange={setValues} />
      </AdvancedSettings>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('sso.saving')
            : mode === 'create'
              ? t('sso.create-connection')
              : t('save')}
        </Button>
      </DialogFooter>
    </form>
  );
}

function BaseConnectionFields<T extends BaseFormValues>({
  values,
  onChange,
}: {
  values: T;
  onChange: (values: T) => void;
}) {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="name" label={t('sso.connection-name')}>
          <Input
            id="name"
            value={values.name}
            onChange={(event) =>
              onChange({ ...values, name: event.target.value })
            }
            placeholder="MyApp"
          />
        </Field>
        <Field htmlFor="label" label={t('sso.connection-label')}>
          <Input
            id="label"
            value={values.label}
            onChange={(event) =>
              onChange({ ...values, label: event.target.value })
            }
            placeholder={t('sso.connection-label-placeholder')}
          />
        </Field>
      </div>

      <Field htmlFor="description" label={t('description')}>
        <Input
          id="description"
          value={values.description}
          maxLength={100}
          onChange={(event) =>
            onChange({ ...values, description: event.target.value })
          }
          placeholder={t('sso.connection-description-placeholder')}
        />
      </Field>

      <Field
        htmlFor="defaultRedirectUrl"
        label={t('sso.default-redirect-url')}
        description={t('sso.default-redirect-url-description')}
      >
        <Input
          id="defaultRedirectUrl"
          type="url"
          value={values.defaultRedirectUrl}
          onChange={(event) =>
            onChange({ ...values, defaultRedirectUrl: event.target.value })
          }
          placeholder="https://example.com"
        />
      </Field>

      <RedirectUrlsField values={values} onChange={onChange} />

      <Field
        htmlFor="sortOrder"
        label={t('sso.sort-order')}
        description={t('sso.sort-order-description')}
      >
        <Input
          id="sortOrder"
          type="number"
          min="0"
          value={values.sortOrder}
          onChange={(event) =>
            onChange({ ...values, sortOrder: event.target.value })
          }
          placeholder="10"
        />
      </Field>
    </>
  );
}

function RedirectUrlsField<T extends BaseFormValues>({
  values,
  onChange,
}: {
  values: T;
  onChange: (values: T) => void;
}) {
  const { t } = useTranslation('common');

  const updateUrl = (index: number, value: string) => {
    onChange({
      ...values,
      redirectUrl: values.redirectUrl.map((url, currentIndex) =>
        currentIndex === index ? value : url
      ),
    });
  };

  const removeUrl = (index: number) => {
    const nextUrls = values.redirectUrl.filter(
      (_, currentIndex) => currentIndex !== index
    );
    onChange({
      ...values,
      redirectUrl: nextUrls.length > 0 ? nextUrls : [''],
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{t('sso.allowed-redirect-urls')}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({ ...values, redirectUrl: [...values.redirectUrl, ''] })
          }
        >
          <Plus className="h-4 w-4" />
          {t('sso.add-url')}
        </Button>
      </div>
      <div className="space-y-2">
        {values.redirectUrl.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(event) => updateUrl(index, event.target.value)}
              placeholder="https://example.com"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('sso.remove-url')}
              onClick={() => removeUrl(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('sso.allowed-redirect-urls-description')}
      </p>
    </div>
  );
}

function MetadataDialog({
  connection,
  open,
  onOpenChange,
}: {
  connection: SSOConnectionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('common');
  const metadata = connection
    ? isSAMLConnection(connection)
      ? connection.idpMetadata
      : connection.oidcProvider?.metadata
    : null;
  const metadataText = metadata ? JSON.stringify(metadata, null, 2) : '';

  const handleCopy = () => {
    copyToClipboard(metadataText);
    toast.success(t('copied-to-clipboard'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {connection && isSAMLConnection(connection)
              ? t('sso.idp-metadata')
              : t('sso.provider-metadata')}
          </DialogTitle>
          <DialogDescription>
            {connection
              ? providerName(connection, t('sso.unknown-provider'))
              : ''}
          </DialogDescription>
        </DialogHeader>
        {metadata ? (
          <div className="space-y-3">
            {connection && isSAMLConnection(connection) && (
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <MetadataValue
                  label={t('sso.entity-id')}
                  value={connection.idpMetadata.entityID}
                />
                <MetadataValue
                  label={t('sso.certificate-validity')}
                  value={connection.idpMetadata.validTo || t('not-supported')}
                />
              </div>
            )}
            <pre className="max-h-[55vh] overflow-auto rounded-md border bg-slate-100/60 dark:bg-slate-700/60 p-4 text-xs text-slate-900 dark:text-slate-100">
              {metadataText}
            </pre>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                {t('copy')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <EmptyState title={t('sso.no-metadata-title')} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  isSubmitting,
  destructive,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  isSubmitting: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('sso.processing') : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioOption({
  id,
  value,
  label,
}: {
  id: string;
  value: string;
  label: string;
}) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm"
    >
      <RadioGroupItem id={id} value={value} />
      {label}
    </Label>
  );
}

function Field({
  htmlFor,
  label,
  description,
  required,
  children,
}: {
  htmlFor: string;
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}

function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="border-b pb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
      {children}
    </div>
  );
}

function SeparatorWithText({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {children}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

function AdvancedSettings({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');

  return (
    <details className="rounded-md border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        {t('sso.advanced-settings')}
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}

function MetadataValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-md border p-3">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all text-sm text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
