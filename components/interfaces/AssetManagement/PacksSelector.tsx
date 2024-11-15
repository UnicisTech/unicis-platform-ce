// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

import React, { useEffect, useState } from 'react';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { usePacks } from '@/hooks/fleets/packs/usePacks';
import { Pack } from '@/types';

interface PacksSelectorProps {
  fleetTeamId: string;
  onSelect: (packIds: string[]) => void;
  setSectionPack: (packIds: string[]) => void;
  preSelectedPack?: Pack[];
}

const PacksSelector: React.FC<PacksSelectorProps> = ({ fleetTeamId, onSelect, setSectionPack, preSelectedPack = [] }) => {

  const { packs, isLoading, isError } = usePacks(fleetTeamId!);
  const [selectedPackOptions, setSelectedPackOptions] = useState<any[]>([]);

  useEffect(() => {
    // Set initial selected options based on preSelectedPackIds
    if (packs && preSelectedPack.length > 0) {
      const initialSelectedOptions = packs
        .filter(pack => preSelectedPack.some(prePack => prePack.id === pack.id))
        .map((pack) => ({
          value: pack.id,
          label: `${pack.name || 'Unknown Pack'} - ${pack.platform} - v${pack.version}`
        }));
      setSelectedPackOptions(initialSelectedOptions);
    }
  }, [packs, preSelectedPack]);

  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const packOptions = packs.map((pack) => ({
    value: pack.id,
    label: `${pack.name || 'Unknown Pack'} - ${pack.platform} - v${pack.version}`
  }));

  const handlePackChange = (selectedOptions: any) => {
    const selectedPackIds = selectedOptions.map((option: { value: string }) => option.value);

    setSelectedPackOptions(selectedOptions);
    setSectionPack(selectedPackIds);
    onSelect(selectedPackIds);
  };

  return (
    <WithoutRing>
      {packs.length === 0 ? (
        <p>No packs found</p>
      ) : (
       <Select
        inputId="multi-select-packs"
        className="multi-select text-sm ring-1 rounded"
        classNamePrefix="react-select"
        options={packOptions}
        onChange={handlePackChange}
        value={selectedPackOptions}
        placeholder="Select Pack(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default PacksSelector;
