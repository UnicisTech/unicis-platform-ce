import { createTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import type {
  TaskProperties,
  PiaRisk,
  RiskProbability,
  RiskSecurity,
} from 'types';

const VALID_PROBABILITIES = [
  'rare',
  'unlikely',
  'possible',
  'probable',
  'severe',
];
const VALID_SECURITIES = [
  'insignificant',
  'minor',
  'moderate',
  'major',
  'extreme',
];

interface ImportPiaRow {
  title: string;
  confProbability?: string;
  confSecurity?: string;
  availProbability?: string;
  availSecurity?: string;
  transProbability?: string;
  transSecurity?: string;
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

  const { rows } = req.body as { rows: ImportPiaRow[] };

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
    const row = rows[i];
    if (!row.title?.trim()) errors.push(`Row ${i + 1}: title is required`);
    if (
      row.confProbability &&
      !VALID_PROBABILITIES.includes(row.confProbability)
    )
      errors.push(`Row ${i + 1}: invalid confidentiality probability`);
    if (row.confSecurity && !VALID_SECURITIES.includes(row.confSecurity))
      errors.push(`Row ${i + 1}: invalid confidentiality security`);
    if (
      row.availProbability &&
      !VALID_PROBABILITIES.includes(row.availProbability)
    )
      errors.push(`Row ${i + 1}: invalid availability probability`);
    if (row.availSecurity && !VALID_SECURITIES.includes(row.availSecurity))
      errors.push(`Row ${i + 1}: invalid availability security`);
    if (
      row.transProbability &&
      !VALID_PROBABILITIES.includes(row.transProbability)
    )
      errors.push(`Row ${i + 1}: invalid transparency probability`);
    if (row.transSecurity && !VALID_SECURITIES.includes(row.transSecurity))
      errors.push(`Row ${i + 1}: invalid transparency security`);
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

    const risk: PiaRisk = [
      {
        isDataProcessingNecessary: 'necessary',
        isDataProcessingNecessaryAssessment: '',
        isProportionalToPurpose: 'proportional',
        isProportionalToPurposeAssessment: '',
      },
      {
        confidentialityRiskProbability: (row.confProbability ||
          'rare') as RiskProbability,
        confidentialityRiskSecurity: (row.confSecurity ||
          'insignificant') as RiskSecurity,
        confidentialityAssessment: '',
      },
      {
        availabilityRiskProbability: (row.availProbability ||
          'rare') as RiskProbability,
        availabilityRiskSecurity: (row.availSecurity ||
          'insignificant') as RiskSecurity,
        availabilityAssessment: '',
      },
      {
        transparencyRiskProbability: (row.transProbability ||
          'rare') as RiskProbability,
        transparencyRiskSecurity: (row.transSecurity ||
          'insignificant') as RiskSecurity,
        transparencyAssessment: '',
      },
      null,
    ];

    const taskProperties = (task.properties as TaskProperties) || {};
    taskProperties.pia_risk = risk;

    await prisma.task.update({
      where: { id: task.id },
      data: { properties: { ...taskProperties } },
    });

    count++;
  }

  return res.status(200).json({ data: { count }, error: null });
};
