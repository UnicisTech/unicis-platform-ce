import { CourseContentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTeamCourses = async (teamId: string, teamMemberId: string) => {
  try {
    const teamCourses = await prisma.teamCourse.findMany({
      where: {
        teamId
      },
      include: {
        course: true,
        progress: {
          where: {
            teamMemberId
          }
        }
      }
    })
    return teamCourses
  } catch (error) {
    console.error('Error fetching courses for team:', error);
    throw new Error('Failed to fetch courses for team');
  }
}

// export const getCoursesByTeam = async (teamId: string, userId?: string) => {
//   try {
//     const courses = await prisma.course.findMany({
//       where: {
//         teams: {
//           some: {
//             teamId: teamId,
//           },
//         },
//       },
//       include: {
//         teams: true, // Includes TeamCourse relation
//         progress: {
//           where: {
//             userId: userId, // Filter CourseProgress by the passed userId
//           },
//         },
//       },
//     });
//     return courses;
//   } catch (error) {
//     console.error('Error fetching courses for team:', error);
//     throw new Error('Failed to fetch courses for team');
//   }
// }

export const getCourse = async (teamCourseId: string, teamMemberId: string) => {
  return await prisma.teamCourse.findFirstOrThrow({
    where: {
      id: teamCourseId
    },
    include: {
      course: true,
      progress: {
        where: {
          teamMemberId
        }
      }
    }
  })
  // return await prisma.course.findUniqueOrThrow({
  //   where: { id: courseId },
  // });
}

export const createCourse = async ({
  name,
  categoryId,
  contentType,
  questions,
  teamIds,
  programContent,
  description,
  url,
  estimatedTime,
  thumbnail,
}: {
  name: string;
  categoryId: string;
  contentType: CourseContentType;
  questions: any;
  teamIds: string[];
  programContent?: string;
  description?: string;
  url?: string;

  estimatedTime?: number;
  thumbnail?: string;
}) => {
  const course = await prisma.course.create({
    data: {
      name,
      categoryId,
      contentType,
      questions,
      programContent,
      description,
      url,
      estimatedTime,
      thumbnail,
      teams: {
        create: teamIds.map(teamId => ({
          team: { connect: { id: teamId } }  // Connect existing teams by ID
        }))
      }
    }
  });

  return course;
}

export const editCourse = async ({
  courseId,
  name,
  categoryId,
  contentType,
  questions,
  programContent,
  description,
  url,
  estimatedTime,
  thumbnail,
}: {
  courseId: string;
  name?: string;
  categoryId?: string;
  contentType?: CourseContentType;
  questions?: any;
  programContent?: string;
  description?: string;
  url?: string;
  estimatedTime?: number;
  thumbnail?: string;
}) => {
  // Rewrite only question that was changed and leave the rest
  // const updateQuestions = (oldQuestions: any[], updatedQuestions: any[]) => {
  //   return oldQuestions.map((question, index) => {
  //     if (index < updatedQuestions.length) {
  //       return updatedQuestions[index];
  //     }
  //     return question;
  //   });
  // };

  // const oldCourse = await prisma.course.findFirstOrThrow({
  //   where: { id: courseId },
  // })

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      name,
      categoryId,
      contentType,
      questions,
      // questions: updatedQuestions,
      programContent,
      description,
      url,
      estimatedTime,
      thumbnail,
    }
  });

  return course;
};

export const deleteCourse = async (courseId: string) => {
  return await prisma.teamCourse.delete({
    where: { id: courseId },
  })
}