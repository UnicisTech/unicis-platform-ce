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
            },
            include: {
                teamCourse: true,
                teamMember: {
                    include: {
                        user: true
                    }
                },
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