type SourceItem = {
  Code: string;
  Section: string;
  Control: string;
  Requirements: string;
  Status?: string;
};

type TargetItem = {
  id: string;
  code: string;
  section: string;
  control: string;
  label: string;
  requirements: string;
};

type DiffResult = {
  missingInTarget: string[];
  extraInTarget: string[];
  fieldMismatches: Array<{
    code: string;
    field: "section" | "control" | "label" | "requirements";
    sourceValue: string;
    targetValue: string;
  }>;
};

export function compareIsoArrays(
  source: SourceItem[],
  target: TargetItem[]
): DiffResult {
  const sourceByCode: Record<string, SourceItem> = {};
  const targetByCode: Record<string, TargetItem> = {};

  source.forEach((item) => {
    sourceByCode[item.Code] = item;
  });

  target.forEach((item) => {
    targetByCode[item.code] = item;
  });

  const missingInTarget: string[] = [];
  const extraInTarget: string[] = [];
  const fieldMismatches: DiffResult["fieldMismatches"] = [];

  Object.keys(sourceByCode).forEach((code) => {
    const src = sourceByCode[code];
    const tgt = targetByCode[code];

    if (!tgt) {
      missingInTarget.push(code);
      return;
    }

    if (src.Section !== tgt.section) {
      fieldMismatches.push({
        code,
        field: "section",
        sourceValue: src.Section,
        targetValue: tgt.section,
      });
    }

    if (src.Control !== tgt.control) {
      fieldMismatches.push({
        code,
        field: "control",
        sourceValue: src.Control,
        targetValue: tgt.control,
      });
    }

    if (src.Control !== tgt.control) {
      fieldMismatches.push({
        code,
        field: "label",
        sourceValue: src.Control,
        targetValue: tgt.label,
      });
    }

    if (src.Requirements !== tgt.requirements) {
      fieldMismatches.push({
        code,
        field: "requirements",
        sourceValue: src.Requirements,
        targetValue: tgt.requirements,
      });
    }
  });

  Object.keys(targetByCode).forEach((code) => {
    if (!sourceByCode[code]) {
      extraInTarget.push(code);
    }
  });

  return {
    missingInTarget,
    extraInTarget,
    fieldMismatches,
  };
}
