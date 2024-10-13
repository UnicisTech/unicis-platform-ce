import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { CourseFormData } from 'types';
import { isPrismaError } from '@/lib/errors';
import { deleteCourse, editCourse, getCourse } from 'models/iap/course';

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
            case 'PUT':
                await handlePUT(req, res);
                break;
            case 'DELETE':
                await handleDELETE(req, res);
                break;
            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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

// Get course by id
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_course', 'read');

    const { courseId } = req.query as {
        courseId: string;
    };
    
    const course = await getCourse(courseId, teamMember.id)

    return res.status(200).json({ data: course, error: null });
}

// Update course by id
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_course', 'create');

    const course = req.body as CourseFormData

    const { courseId } = req.query as {
        courseId: string;
    };

    const {
        name,
        category,
        type,
        programContent,
        estimatedTime,
        thumbnailLink,
        url,
        description,
        questions
    } = course

    const createdCourse = editCourse({
        courseId,
        name,
        categoryId: category.value,
        contentType: type.value,
        programContent,
        estimatedTime: Number(estimatedTime),
        thumbnail: thumbnailLink,
        url,
        description,
        questions,
    })

    return res.status(200).json({ data: { createdCourse }, error: null });
};

// Delete course by id
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_course', 'delete');

    const { courseId } = req.query as {
        courseId: string;
    };

    await deleteCourse(courseId)

    return res.status(200).json({ data: {}, error: null });
}
