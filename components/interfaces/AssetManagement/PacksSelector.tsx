import React from 'react';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { usePacks } from '@/hooks/fleets/packs/usePack';

interface PacksSelectorProps {
  fleetTeamId: string;
  fleetAccessPhrase: string;
  onSelect: (nodeIds: string[]) => void;
  setSectionPack: (packIds: string[]) => void;
}

const PacksSelector: React.FC<PacksSelectorProps> = ({ fleetTeamId, fleetAccessPhrase, onSelect, setSectionPack }) => {

  const { packs, isLoading, isError } = usePacks(fleetTeamId!, fleetAccessPhrase!);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const packOptions = packs.map((pack) => ({
    value: pack.id,
    label: `${pack.name || 'Unknown Pack'} - ${pack.platform} - v${pack.version}`
  }));

  const handlePackChange = (selectedOptions: any) => {
    // Extract only the values (pack IDs) from the selected options
    const selectedPackIds = selectedOptions.map((option: { value: string }) => option.value);

    // Set the selected pack IDs to state
    setSectionPack(selectedPackIds);

    // Call onSelect with the selected pack IDs
    onSelect(selectedPackIds);
  };

  return (
    <WithoutRing>
      {packs.length === 0 ? (
        <p>No packs found</p>
      ) : (
       <Select
        inputId="multi-select-packs"
        className="multi-select text-sm text-red-500 ring-1 ring-red-500 rounded"
        classNamePrefix="react-select"
        options={packOptions}
        onChange={handlePackChange}
        placeholder="Select a Pack(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default PacksSelector;
