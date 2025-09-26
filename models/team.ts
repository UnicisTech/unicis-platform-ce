import { prisma } from '@/lib/prisma';
import { getCscStatusesProp } from '@/lib/csc';
import { getSession } from '@/lib/session';
import { findOrCreateApp } from '@/lib/svix';
import { Role } from '@prisma/client';
import { controls } from '@/components/defaultLanding/data/configs/csc';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ISO, TeamProperties } from 'types';
import { addSubscription } from './subscription';

export const createTeam = async (param: {
  userEmail: string;
  userId: string;
  name: string;
  slug: string;
}) => {
  const { userId, userEmail, name, slug } = param;

  const team = await prisma.team.create({
    data: {
      name,
      slug,
    },
  });

  await addTeamMember(team.id, userId, Role.ADMIN);

  await addSubscription(team.id, userEmail);

  await findOrCreateApp(team.name, team.id);

  return team;
};

export const getTeam = async (key: { id: string } | { slug: string }) => {
  return await prisma.team.findUniqueOrThrow({
    where: key,
    include: {
      subscription: {
        include: {
          payments: true, // Include payments within the subscription
        },
      },
    },
  });
};

export const deleteTeam = async (key: { id: string } | { slug: string }) => {
  return await prisma.team.delete({
    where: key,
  });
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: Role
) => {
  return await prisma.teamMember.upsert({
    create: {
      teamId,
      userId,
      role,
    },
    update: {
      role,
    },
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  return await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

export const getTeams = async (userId: string) => {
  return await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });
};

export const getOwnedTeams = async (userId: string) => {
  return await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
          role: Role.OWNER,
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });
};

// Check if the user is a member of the team
export async function isTeamMember(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  });

  return (
    teamMember.role === Role.MEMBER ||
    teamMember.role === Role.OWNER ||
    teamMember.role === Role.ADMIN
  );
}

export async function getTeamRoles(userId: string) {
  const teamRoles = await prisma.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      teamId: true,
      role: true,
    },
  });

  return teamRoles;
}

// Check if the user is an admin or owner of the team
export async function isTeamAdmin(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  });

  return teamMember.role === Role.ADMIN || teamMember.role === Role.OWNER;
}

export const getTeamMembers = async (slug: string) => {
  return await prisma.teamMember.findMany({
    where: {
      team: {
        slug,
      },
    },
    include: {
      user: true,
    },
  });
};

export const updateTeam = async (slug: string, data: any) => {
  return await prisma.team.update({
    where: {
      slug,
    },
    data: data,
  });
};

export const isTeamExists = async (condition: any) => {
  return await prisma.team.count({
    where: {
      OR: condition,
    },
  });
};

// Check if the current user has access to the team
// Should be used in API routes to check if the user has access to the team
export const throwIfNoTeamAccess = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const teamMember = await getTeamMember(
    session.user.id,
    req.query.slug as string
  );

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  return {
    ...teamMember,
    user: {
      ...session.user,
    },
  };
};

// Get the current user's team member object
export const getTeamMember = async (userId: string, slug: string) => {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      team: {
        slug,
      },
      role: {
        in: ['ADMIN', 'MEMBER', 'OWNER', 'AUDITOR'],
      },
    },
    include: {
      team: {
        include: {
          subscription: true,
        },
      },
    },
  });

  return teamMember;
};

export const countTeamMembers = async ({ where }) => {
  return await prisma.teamMember.count({
    where,
  });
};

export const incrementTaskIndex = async (teamId: string) => {
  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { taskIndex: { increment: 1 } },
    });
  } catch (error) {
    console.error(error);
  }
};
//TODO: should delete
export const getTeamPropertiesBySlug = async (slug: string) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  return team?.properties;
};

export const getCscStatusesBySlugAndIso = async (slug: string, iso: ISO) => {
  const team = await prisma.team.findUniqueOrThrow({
    where: { slug },
    select: { properties: true },
  });

  const teamProperties = (team?.properties as TeamProperties) || {};
  const cscStatusesProp = getCscStatusesProp(iso);

  if (teamProperties[cscStatusesProp]) {
    // already exists → return it
    return teamProperties[cscStatusesProp];
  }

  // not found → initialize with "Unknown"
  const initial: Record<string, string> = {};
  controls[iso].forEach((control) => {
    initial[control.Control] = 'Unknown';
  });

  await prisma.team.update({
    where: { slug },
    data: {
      properties: {
        ...teamProperties,
        [cscStatusesProp]: initial,
      },
    },
  });

  return initial;
};


export const setCscStatus = async ({
  slug,
  control,
  value,
  framework,
}: {
  slug: string;
  control: string;
  value: string;
  framework: ISO;
}) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  const cscStatusesProp = getCscStatusesProp(framework);

  const cscStatuses = { ...teamProperties[cscStatusesProp] };
  cscStatuses[control] = value;

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: {
        ...teamProperties,
        [cscStatusesProp]: cscStatuses,
      },
    },
  });

  return cscStatuses;
};

export const getCscIso = async ({
  slug,
}: {
  slug: string;
}): Promise<ISO[]> => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  if (teamProperties?.csc_iso) {
    return teamProperties?.csc_iso;
  }

  // TODO: create enum form ISO type
  const initial = ['default'] as ISO[];

  const updatedProperties = {
    ...teamProperties,
    csc_iso: initial,
  };

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: updatedProperties,
    },
  });

  return initial;
};

export const setCscIso = async ({
  slug,
  iso,
}: {
  slug: string;
  iso: ISO[];
}) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: slug,
    },
    select: {
      properties: true,
    },
  });

  const teamProperties = team ? (team.properties as TeamProperties) : {};

  const updatedProperties = {
    ...teamProperties,
    csc_iso: iso,
  };

  await prisma.team.update({
    where: { slug: slug },
    data: {
      properties: updatedProperties,
    },
  });

  return iso;
};
