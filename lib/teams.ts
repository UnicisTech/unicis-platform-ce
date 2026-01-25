import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { getSession } from './session';
import { getTeamMember } from 'models/team';
import { getCurrentPlan, subscriptions } from './subscriptions';
import { TeamProperties } from 'types';

export async function getTeamAccess(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res'],
  query: any
) {
  const session = await getSession(req, res);
  const userId = session?.user.id as string | undefined;
  const slug = query.slug as string | undefined;

  if (!userId || !slug || !session) {
    // для team-сторінок це зазвичай redirect на login або notFound
    return null;
  }

  const teamMember = await getTeamMember(userId, slug);
  // ВАЖЛИВО: getTeamMember має include/select team.subscription + team.properties
  const team = teamMember.team;

  const plan = getCurrentPlan(team.subscription);
  const teamFeatures = subscriptions[plan].teamFeatures;

  return { session, teamMember, team, plan, teamFeatures, teamProperties: team.properties as TeamProperties };
}

