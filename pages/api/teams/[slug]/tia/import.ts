import { createTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import type { TaskProperties, TiaProcedureInterface } from 'types';

interface ImportTiaRow {
  title: string;
  dataExporter?: string;
  countryExporter?: string;
  dataImporter?: string;
  countryImporter?: string;
  assessmentDate?: string;
  assessmentYears?: string;
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

  const { rows } = req.body as { rows: ImportTiaRow[] };

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
    const task = await createTask({
      authorId,
      teamId,
      title: row.title.trim(),
      status: 'todo',
      duedate: null,
      description: '',
    });

    const years = Number(row.assessmentYears) || 1;
    const defaultNa = 'na' as const;
    const defaultZero = '0' as const;

    const procedure: TiaProcedureInterface = [
      {
        DataExporter: row.dataExporter || '',
        CountryDataExporter: row.countryExporter || '',
        DataImporter: row.dataImporter || '',
        CountryDataImporter: row.countryImporter || '',
        TransferScenario: '',
        DataAtIssue: '',
        HowDataTransfer: '',
        StartDateAssessment: row.assessmentDate || '',
        AssessmentYears: years,
        LawImporterCountry: '',
      },
      {
        EncryptionInTransit: defaultNa,
        ReasonEncryptionInTransit: '',
        TransferMechanism: defaultNa,
        ReasonTransferMechanism: '',
        LawfulAccess: defaultNa,
        ReasonLawfulAccess: '',
        MassSurveillanceTelecommunications: defaultNa,
        ReasonMassSurveillanceTelecommunications: '',
        SelfReportingObligations: defaultNa,
        ReasonSelfReportingObligations: '',
      },
      {
        WarrantsSubpoenas: defaultZero,
        ReasonWarrantsSubpoenas: '',
        ViolationLocalLaw: defaultZero,
        ReasonViolationLocalLaw: '',
        HighViolationLocalLaw: defaultZero,
        ReasonHighViolationLocalLaw: '',
        HighViolationDataIssue: defaultZero,
        ReasonHighViolationDataIssue: '',
        InvestigatingImporter: defaultZero,
        ReasonInvestigatingImporter: '',
        PastWarrantSubpoena: defaultZero,
        ReasonPastWarrantSubpoena: '',
        DataIssueInvestigation: defaultZero,
        ReasonDataIssueInvestigation: '',
        LocalIssueWarrants: defaultZero,
        ReasonLocalIssueWarrants: '',
        LocalMassSurveillance: defaultZero,
        ReasonLocalMassSurveillance: '',
        LocalAccessMassSurveillance: defaultZero,
        ReasonLocalAccessMassSurveillance: '',
        LocalRoutinelyMonitor: defaultZero,
        ReasonLocalRoutinelyMonitor: '',
        PassMassSurveillance: defaultZero,
        ReasonPassMassSurveillance: '',
        PassMassSurveillanceConnection: defaultZero,
        ReasonPassMassSurveillanceConnection: '',
        ImporterObligation: defaultZero,
        ReasonImporterObligation: '',
        LocalSelfReporting: defaultZero,
        ReasonLocalSelfReporting: '',
        PastSelfReporting: defaultZero,
        ReasonPastSelfReporting: '',
        AssessmentProduceReport: defaultZero,
        ReasonAssessmentProduceReport: '',
      },
      {
        RelevantDataTransferImporter: '',
        ProbabilityDataTransferImporter: '',
        ReasonDataTransferImporter: '',
        RelevantTransferToImporter: '',
        ProbabilityTransferToImporter: '',
        ReasonTransferToImporter: '',
        RelevantTransferToImporterForPerformance: '',
        ProbabilityTransferToImporterPerformance: '',
        ReasonTransferToImporterPerformance: '',
        RelevantLegalGround: '',
        ProbabilityLegalGround: '',
        ReasonLegalGround: '',
        ConnectionTargetedAccess: 'no',
        ReasonConnectionTargetedAccess: '',
        ConnectionSurveillanceTele: 'no',
        ReasonConnectionSurveillanceTele: '',
        ConnectionSelfreportingObligations: 'no',
        ReasonConnectionSelfreportingObligations: '',
      },
    ];

    const taskProperties = (task.properties as TaskProperties) || {};
    taskProperties.tia_procedure = procedure;

    await prisma.task.update({
      where: { id: task.id },
      data: { properties: { ...taskProperties } },
    });

    count++;
  }

  return res.status(200).json({ data: { count }, error: null });
};
