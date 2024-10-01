import { countCourseProgress } from '@/lib/iap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//TODO: should include teamCourse an teamMember?
export const getUserCourseProgress = async (teamMemberId: string, teamCourseId: string) => {
    try {
        const courseProgress = await prisma.courseProgress.findUnique({
            where: {
                teamCourseId_teamMemberId: {
                    teamCourseId,
                    teamMemberId
                }
                // courseId_userId: {
                //     courseId,
                //     userId,
                // },
            },
            include: {
                teamCourse: true,  // Include course details if needed
                teamMember: {
                    include: {
                        user: true
                    }
                },    // Include user details if needed
            },
        });

        if (!courseProgress) {
            return null
        }

        return courseProgress;
    } catch (error) {
        console.error('Error fetching course progress:', error);
        throw error;
    }
};

export const saveUserCourseProgress = async (teamMemberId: string, teamCourseId: string, answers: any) => {
    try {
        const progress = countCourseProgress(answers)
        console.log('saveUserCourseProgress progress', progress)
        const courseProgress = await prisma.courseProgress.upsert({
            where: {
                teamCourseId_teamMemberId: {
                    teamCourseId,
                    teamMemberId
                }
            },
            update: {
                answers,
                progress
            },
            create: {
                teamCourseId,
                teamMemberId,
                answers, // Create a new entry with provided data
                progress
            },
        });

        return courseProgress;
    } catch (error) {
        console.error('Error saving course progress:', error);
        throw error;
    }
};