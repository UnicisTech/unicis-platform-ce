import { createTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import type { TaskProperties, RMProcedureInterface } from 'types';

interface ImportRmRow {
  title: string;
  risk?: string;
  assetOwner?: string;
  impact?: string;
  rawProbability?: string;
  rawImpact?: string;
  riskTreatment?: string;
  treatmentCost?: string;
  treatmentStatus?: string;
  treatedProbability?: string;
  treatedImpact?: string;
}

function clamp(val: string | undefined, fallback: number): number {
  if (!val) return fallback;
  const n = Number(val);
  if (isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
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

  const { rows } = req.body as { rows: ImportRmRow[] };

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
    if (!rows[i].title?.trim()) errors.push(`Row ${i + 1}: title is required`);
    if (!rows[i].risk?.trim()) errors.push(`Row ${i + 1}: risk is required`);
  }

  if (errors.length > 0) {
    return res.status(422).json({
      data: null,
      error: { message: errors.join('; ') },
    });
  }

  let count = 0;
  for (const row of rows) {
    const task = await createTask({
      authorId,
      teamId,
      title: row.title.trim(),
      status: 'todo',
      duedate: null,
      description: '',
    });

    const rmRisk: RMProcedureInterface = [
      {
        Risk: row.risk || '',
        AssetOwner: row.assetOwner || '',
        Impact: row.impact || '',
        RawProbability: clamp(row.rawProbability, 20),
        RawImpact: clamp(row.rawImpact, 20),
      },
      {
        RiskTreatment: row.riskTreatment || '',
        TreatmentCost: row.treatmentCost || '',
        TreatmentStatus: clamp(row.treatmentStatus, 0),
        TreatedProbability: clamp(row.treatedProbability, 20),
        TreatedImpact: clamp(row.treatedImpact, 20),
      },
    ];

    const taskProperties = (task.properties as TaskProperties) || {};
    taskProperties.rm_risk = rmRisk;

    await prisma.task.update({
      where: { id: task.id },
      data: { properties: { ...taskProperties } },
    });

    count++;
  }

  return res.status(200).json({ data: { count }, error: null });
};
