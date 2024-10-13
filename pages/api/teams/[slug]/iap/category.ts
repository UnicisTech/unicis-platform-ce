import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { isPrismaError } from '@/lib/errors';
import { createCategory, getAvailableCategoriesForTeam } from 'models/iap/category';

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
                res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
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

        return res.status(status).json({ error: { message } });
    }
}

// Get team IAP categories
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap', 'read');

    const team = teamMember.team;

    const categories = await getAvailableCategoriesForTeam(team.id)

    return res.status(200).json({ data: categories, error: null });
}

// Create new category
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    const teamMember = await throwIfNoTeamAccess(req, res);
    throwIfNotAllowed(teamMember, 'iap_admin', 'create');

    const category = createCategory({name: req.body.name as string, teamId: teamMember.team.id})

    return res.status(200).json({ data: category, error: null });
};
