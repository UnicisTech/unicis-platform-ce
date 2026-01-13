import { TFunction } from 'next-i18next';
import { MemberName } from "@/components/shared";

export const auditLogHelper = (
  field: string | undefined,
  value: string | string[] | undefined,
  t: TFunction,
  membersById: Map<string, string>,
) => {
  if (value == null) return <span>—</span>;

  switch (field) {
    case 'AssetOwner':
        return <MemberName userId={value as string} membersById={membersById} fallback={t('not-found')}/>
    // plain text / scalar
    case 'Risk':
    case 'Impact':
    case 'RiskTreatment':
    case 'TreatmentCost':
      return <span>{value}</span>;
    // percentages
    case 'RawImpact':
    case 'RawProbability':
    case 'TreatedImpact':
    case 'TreatedProbability':
    case 'TreatmentStatus':
      return <span>{value}%</span>
    default:
      return <span>{value}</span>;
  }
};