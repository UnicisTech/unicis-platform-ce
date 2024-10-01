import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { CourseFormData } from 'types';
import { isPrismaError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { createCourse, getTeamCourses } from 'models/iap/course';

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
                res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
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

// Get team courses
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap', 'read');

    const session = await getSession(req, res);
    const userId = session?.user.id;

    const team = teamMember.team;

    // const courses = await getCoursesByTeam(team.id, userId)

    const teamCourses = await getTeamCourses(team.id, teamMember.id)

    console.log('Get IAP coursescourses', { teamCourses: teamCourses.length})

    return res.status(200).json({ data: teamCourses, error: null });
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap', 'create');

    const course = req.body as CourseFormData

    const { 
        name, 
        category, 
        type, 
        programContent, 
        teams, 
        description,
        estimatedTime, 
        thumbnailLink, 
        url, 
        questions 
    } = course

    const createdCourse = createCourse({ 
        name, 
        categoryId: category.value, 
        contentType: type.value, 
        programContent, 
        teamIds: teams.map(({value}) => value), 
        estimatedTime: Number(estimatedTime),
        thumbnail: thumbnailLink,
        description,
        url,
        questions,
    })

    return res.status(200).json({ data: { createdCourse }, error: null });
}
