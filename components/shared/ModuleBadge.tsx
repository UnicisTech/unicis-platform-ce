// Module badge — self-contained, no DaisyUI dependency
const colorMap: Record<string, string> = {
  rpa_procedure: 'bg-red-600 text-red-100',
  tia_procedure: 'bg-blue-600 text-blue-100',
  pia_risk:      'bg-yellow-500 text-yellow-950',
  rm_risk:       'bg-green-600 text-green-100',
  csc_controls:  'bg-slate-500 text-slate-100',
};

const labelMap: Record<string, string> = {
  rpa_procedure: 'RPA',
  tia_procedure: 'TIA',
  pia_risk:      'PIA',
  rm_risk:       'RM',
  csc_controls:  'CSC',
};

const ModuleBadge = ({ propName }: { propName: string }) => {
  const colorClass = colorMap[propName] ?? 'bg-slate-500 text-slate-100';
  const label      = labelMap[propName]  ?? propName.toUpperCase();

  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-2 py-[2px] text-[11px] font-medium leading-tight align-middle ${colorClass}`}
    >
      {label}
    </span>
  );
};

export default ModuleBadge;
