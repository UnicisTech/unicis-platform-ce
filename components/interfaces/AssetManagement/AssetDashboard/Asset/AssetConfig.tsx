import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import { useAssetConfig } from '@/hooks/fleets/Nodes';
import { CodeBlock } from '@/components/shared/CodeBlock';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';

const AssetConfig = ({
  fleetTeamId,
  nodeID,
  user: _user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  nodeID: string;
}) => {
  const { config, isLoading, isError } = useAssetConfig(fleetTeamId, nodeID);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const options = config?.options || {};
  const packs = config?.packs || {};
  const schedule = config?.schedule || {};

  const packCount = Object.keys(packs).length;
  const scheduledQueryCount = Object.keys(schedule).length;
  const packQueryCount = Object.values(packs).reduce((count: number, pack: any) => {
    return count + Object.keys(pack?.queries || {}).length;
  }, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Host identifier</p>
              <p className="font-medium break-words">{options.host_identifier || '-'}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Logger plugin</p>
              <p className="font-medium break-words">{options.logger_plugin || '-'}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Logger endpoint</p>
              <p className="font-medium break-words">{options.logger_tls_endpoint || '-'}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Logger TLS period</p>
              <p className="font-medium">{String(options.logger_tls_period ?? '-')}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Packs</p>
              <p className="font-medium">{packCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Pack queries</p>
              <p className="font-medium">{packQueryCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Scheduled queries</p>
              <p className="font-medium">{scheduledQueryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <details className="rounded-md border bg-muted/20 p-3">
        <summary className="cursor-pointer text-sm font-medium">Show raw config</summary>
        <div className="mt-3">
          <CodeBlock
            language="JSON"
            shouldWrapLongLines
            i18nIsDynamicList={true}
            showLineNumbers={false}
            text={JSON.stringify(config, null, 2)}
          />
        </div>
      </details>
    </div>
  );
};

export default AssetConfig;
