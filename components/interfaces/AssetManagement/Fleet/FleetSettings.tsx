import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import type { Team, User } from '@/generated/client';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { useFleetConnection } from '@/hooks/fleets/connect/useFleetConnection';
import {
  fleetAccessTokenCookieName,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';

const SettingsFleet = ({
  user,
  team,
}: {
  user: Partial<User>;
  team?: Team;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const { connection, disconnect, isDisconnected } = useFleetConnection(
    team?.id
  );
  const nameParts = user?.name?.split(' ') ?? [];
  const firstName = user?.firstName || nameParts[0] || '';
  const lastName = user?.lastName || nameParts.slice(1).join(' ') || '';

  const handleDisconnect = async () => {
    if (!team?.id) {
      return;
    }

    try {
      await disconnect();
      Cookies.remove(fleetAccessTokenCookieName);
      Cookies.remove(legacyFleetAccessTokenCookieName);
      toast.success(t('fleet:fleet-disconnected'));
    } catch {
      toast.error(t('fleet:fleet-connect-failed'));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-slate-50/40 px-6 py-5">
        <div>
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-700">
            {t('fleet:fleet-settings')}
          </CardTitle>
          <CardDescription className="mt-2 text-base text-slate-500">
            {t('fleet:fleet-settings-description')}
          </CardDescription>
        </div>

        <Badge
          variant={isDisconnected ? 'outline' : 'secondary'}
          className={
            isDisconnected
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }
        >
          {isDisconnected
            ? t('fleet:fleet-disconnected')
            : t('fleet:fleet-connected')}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 px-6 py-6">
        {isDisconnected && (
          <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-muted-foreground">
            {t('fleet:fleet-disconnected-retention', {
              date: connection?.deleteAfter
                ? new Date(connection.deleteAfter).toLocaleDateString()
                : '-',
            })}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="fleet-first-name"
              className="text-base font-semibold"
            >
              {t('first-name')}
            </Label>
            <Input id="fleet-first-name" value={firstName} readOnly />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="fleet-last-name"
              className="text-base font-semibold"
            >
              {t('last-name')}
            </Label>
            <Input id="fleet-last-name" value={lastName} readOnly />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fleet-email" className="text-base font-semibold">
            {t('email')}
          </Label>
          <Input id="fleet-email" value={user?.email ?? ''} readOnly />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fleet-password" className="text-base font-semibold">
            {t('fleet:fleet-password')}
          </Label>
          <Input
            id="fleet-password"
            type="password"
            value="************"
            readOnly
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-3 border-t px-6 py-5">
        <Button
          type="button"
          variant="destructive"
          disabled={!team?.id || isDisconnected}
          onClick={handleDisconnect}
        >
          {t('disconnect')}
        </Button>

        <Button type="button" disabled>
          {t('save')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsFleet;
