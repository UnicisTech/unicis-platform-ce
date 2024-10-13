import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { isPrismaError } from '@/lib/errors';
import { getUserCourseProgress, saveUserCourseProgress } from 'models/iap/courseProgress';

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
            case 'POST':
                await handlePOST(req, res);
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_course', 'read');

    const { courseId } = req.query as {
        courseId: string;
    };

    const progress = await getUserCourseProgress(teamMember.id, courseId)

    return res.status(200).json({ data: progress, error: null });
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_course', 'update');

    const answers = req.body as any

    const { courseId } = req.query as {
        courseId: string;
    };

    const data = await saveUserCourseProgress(teamMember.id, courseId, answers)

    return res.status(200).json({ data: { data }, error: null });
};
