import React from 'react';
import { TFunction } from 'next-i18next';
import { MemberName } from '@/components/shared';

type AuditValue = string | string[] | null | undefined;

const joinOrDash = (v: AuditValue) => {
  if (v == null) return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return v ? String(v) : '—';
};

const trOne = (t: TFunction, key: string, v: string) => t(`${key}.${v}`);

const trMany = (t: TFunction, key: string, v: string | string[]) => {
  if (Array.isArray(v)) {
    if (!v.length) return '—';
    return v.map(x => trOne(t, key, String(x))).join(', ');
  }
  return trOne(t, key, String(v));
};

export const auditLogHelper = (
  field: string | undefined,
  value: AuditValue,
  t: TFunction,
  membersById: Map<string, string>,
) => {
  if (value == null) return <span>—</span>;

  switch (field) {
    case 'dpo':
        return <MemberName userId={value as string} membersById={membersById} fallback={t('not-found')}/>
    // plain text / scalar
    case 'reviewDate':
    case 'controller':
    case 'purpose':
    case 'commentsretention':
    case 'recipientdetails':
    case 'recipient':
    case 'datatransfer':
      return <span>{joinOrDash(value)}</span>;

    // bool-like / yes-no selectors
    case 'involveProfiling':
    case 'useAutomated':
    case 'involveSurveillance':
    case 'processedSpecialCategories':
    case 'isBigData':
    case 'dataSetsCombined':
    case 'multipleControllers':
    case 'imbalanceInRelationship':
    case 'innovativeTechnologyUsed':
    case 'transferredOutside':
    case 'rightsRestricted':
    case 'piaNeeded':
      // return <span>{trMany(t, `${field}`, value as any)}</span>;
      return <span>{t(value)}</span>;


    // multi-select selectors
    case 'category':
      return <span>{trMany(t, `rpa:category`, value as any)}</span>;
    case 'specialcategory':
      return <span>{trMany(t, `rpa:special-category`, value as any)}</span>;
    case 'datasubject':
      return <span>{trMany(t, `rpa:data-subject`, value as any)}</span>;
    case 'guarantee':
      return <span>{trMany(t, `rpa:guarantee`, value as any)}</span>;
    case 'toms':
      return <span>{trMany(t, `rpa:toms`, value as any)}</span>;

    // single-select selectors (trMany in case of broken data)
    case 'retentionperiod':
      return <span>{trMany(t, `rpa:retention-period`, value as any)}</span>;
    case 'recipientType':
      return <span>{trMany(t, `rpa:recipient-type`, value as any)}</span>;
    case 'country':
      return <span>{trMany(t, `country`, value as any)}</span>;
    default:
      return <span>{joinOrDash(value)}</span>;
  }
};
