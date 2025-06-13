import DaisyBadge, { ThemeAppearance } from "./daisyUI/DaisyBadge";

const colorMap: Record<string, ThemeAppearance> = {
  rpa_procedure: "error",
  tia_procedure: "primary",
  pia_risk: "warning",
  rm_risk: "success",
};

const labelMap: Record<string, string> = {
  rpa_procedure: "RPA",
  tia_procedure: "TIA",
  pia_risk: "PIA",
  rm_risk: "RM",
};

const ModuleBadge = ({ propName }: { propName: string }) => {
  const color = colorMap[propName] || "default";
  const label = labelMap[propName] || propName.toUpperCase();

  return <DaisyBadge color={color}>{label}</DaisyBadge>;
};

export default ModuleBadge;
