import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { getSession } from './session';
import { getTeamMember } from 'models/team';
import { getCurrentPlan, subscriptions } from './subscriptions';
import { parseTeamProperties } from '@/lib/properties';

export async function getTeamAccess(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res'],
  query: any
) {
  const session = await getSession(req, res);
  const userId = session?.user.id as string | undefined;
  const slug = query.slug as string | undefined;

  if (!userId || !slug || !session) {
    return null;
  }

  const teamMember = await getTeamMember(userId, slug);
  const team = teamMember.team;

  const plan = getCurrentPlan(team.subscription);
  const teamFeatures = subscriptions[plan].teamFeatures;

  return {
    session,
    teamMember,
    team,
    plan,
    teamFeatures,
    teamProperties: parseTeamProperties(team.properties).properties,
  };
}
