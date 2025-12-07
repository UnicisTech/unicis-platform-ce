import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { usePacks } from "@/hooks/fleets/packs/usePacks";
import { Pack } from "@/types";
import { MultiSelect } from "@/components/shadcn/ui/multi-select";

interface PacksSelectorProps {
  fleetTeamId: string;
  onSelect: (packIds: string[]) => void;
  setSectionPack: (packIds: string[]) => void;
  preSelectedPack?: Pack[];
}

const PacksSelector: React.FC<PacksSelectorProps> = ({
  fleetTeamId,
  onSelect,
  setSectionPack,
  preSelectedPack = [],
}) => {
  const { t } = useTranslation("common");
  const { packs, isLoading, isError } = usePacks(fleetTeamId!);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);

  useEffect(() => {
    if (packs && preSelectedPack.length > 0) {
      const preselectedIds = preSelectedPack
        .map((pack) => pack.id)
        .filter((id) => packs.some((p) => p.id === id));
      setSelectedPackIds(preselectedIds);
    }
  }, [packs, preSelectedPack]);

  if (isLoading) return <p>{t("loading")}</p>;
  if (isError) return <p>{t("error-loading-packs")}</p>;

  const packOptions = packs.map((pack) => ({
    value: pack.id,
    label: `${pack.name || t("unknown-pack")} - ${pack.platform} - v${pack.version}`,
  }));

  const handlePackChange = (newSelected: string[]) => {
    setSelectedPackIds(newSelected);
    setSectionPack(newSelected);
    onSelect(newSelected);
  };

  return (
    packs.length === 0 ? (
      <p>{t("no-packs-found")}</p>
    ) : (
      <MultiSelect
        options={packOptions}
        defaultValue={selectedPackIds}
        onValueChange={handlePackChange}
        placeholder={t("select-packs")}
        maxCount={3}
      />
    )
  );
};

export default PacksSelector;