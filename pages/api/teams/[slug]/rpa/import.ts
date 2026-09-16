import { createTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import type { RpaProcedureInterface } from 'types';
import { setTaskProperty } from '@/lib/properties';

interface ImportRpaRow {
  title: string;
  controller?: string;
  reviewDate?: string;
  dataTransfer?: string;
  specialCategories?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'create');

  const { rows } = req.body as { rows: ImportRpaRow[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      data: null,
      error: { message: 'No rows provided.' },
    });
  }

  const {
    user: { id: authorId },
    teamId,
  } = teamMember;

  const errors: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].title?.trim()) {
      errors.push(`Row ${i + 1}: title is required`);
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      data: null,
      error: { message: errors.join('; ') },
    });
  }

  let count = 0;
  for (const row of rows) {
    const categories = row.specialCategories
      ? row.specialCategories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const procedure: RpaProcedureInterface = [
      {
        reviewDate: row.reviewDate || '',
        controller: row.controller || '',
        dpo: '',
      },
      {
        purpose: '',
        category: [],
        datasubject: [],
        retentionperiod: '',
        specialcategory: categories,
        commentsretention: '',
      },
      {
        recipientType: '',
        recipientdetails: '',
      },
      {
        datatransfer: row.dataTransfer === 'true',
        recipient: '',
        country: '',
        guarantee: [],
      },
      {
        toms: [],
      },
      {
        involveProfiling: 'no',
        useAutomated: 'no',
        involveSurveillance: 'no',
        processedSpecialCategories: 'no',
        isBigData: 'no',
        dataSetsCombined: 'no',
        multipleControllers: 'no',
        imbalanceInRelationship: 'no',
        innovativeTechnologyUsed: 'no',
        transferredOutside: 'no',
        rightsRestricted: 'no',
        piaNeeded: 'no',
      },
    ];

    await createTask({
      authorId,
      teamId,
      title: row.title.trim(),
      status: 'todo',
      duedate: null,
      description: '',
      properties: setTaskProperty({}, 'rpa_procedure', procedure),
    });

    count++;
  }

  return res.status(200).json({ data: { count }, error: null });
};
