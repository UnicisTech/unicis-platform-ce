import type { NextApiRequest, NextApiResponse } from 'next';
import { getTeamMembers, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { isPrismaError } from '@/lib/errors';
import { Role } from '@prisma/client';
import { getUserCourseProgress } from 'models/iap/courseProgress';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;
    try {
        switch (method) {
            case 'GET':
                await handleGET(req, res);
                break;
            default:
                res.setHeader('Allow', ['GET']);
                res.status(405).json({
                    data: null,
                    error: { message: `Method ${method} Not Allowed` },
                });
        }
    } catch (error: any) {
        const message = error.message || 'Something went wrong';
        const status = error.status || 500;

        if (isPrismaError(error)) {
            return res.status(status).json({ error: "Prisma Error" });
        }

        res.status(status).json({ error: { message } });
    }
}

// Get team members with progresses for course
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap', 'read');

    const { slug, courseId } = req.query as {
        slug: string;
        courseId: string;
    };
    
    const members = await getTeamMembers(slug)
    const membersWithoutAuditors = members.filter(member => member.role !== Role.AUDITOR)

    const progress = await Promise.all(membersWithoutAuditors.map(({id}) => getUserCourseProgress(id, courseId)))
    const teamMembersWithProgress = membersWithoutAuditors.map(member => ({...member, progress: progress.find((item) => item?.teamMemberId === member.id)}))

    return res.status(200).json({ data: {teamMembersWithProgress}, error: null });
}
