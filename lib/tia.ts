import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import { prisma } from '@/lib/prisma';
import type { TeamMember } from '@prisma/client';
import type { User } from 'next-auth';
import type { Session } from 'next-auth';
import { RpaOption, RpaProcedureInterface, TiaProcedureInterface } from 'types';
import { ChangeLog, RpaConfig } from 'types';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskId: number;
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface | [];
}) => {
  const { taskId, user, prevProcedure, nextProcedure } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });
  const taskProperties = task?.properties as any;
  delete taskProperties.tia_procedure;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  // await addAuditLogs({
  //   taskId,
  //   taskProperties,
  //   user,
  //   prevProcedure,
  //   nextProcedure,
  // });
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskId: number;
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { user, taskId, prevProcedure, nextProcedure } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  taskProperties.tia_procedure = nextProcedure;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  // await addAuditLogs({
  //   taskId,
  //   taskProperties,
  //   user,
  //   prevProcedure,
  //   nextProcedure,
  // });
};

// export const isTeamOwner = (user: User, members: TeamMember[]) => {
//   const owner = members.filter(
//     (member) => member.userId === user.id && member.role === 'owner'
//   );

//   return owner.length > 0;
// };

// export const tiaNavigations = (slug: string, activeTab: string) => {
//   return [
//     {
//       name: 'Overview',
//       href: `/privacy/tia/${slug}/overview`,
//       active: activeTab === 'overview',
//     },
//     {
//       name: 'Transfer Impact Assessment',
//       href: `/privacy/tia/${slug}/tia`,
//       active: activeTab === 'assessment',
//     },
//   ];
// };
