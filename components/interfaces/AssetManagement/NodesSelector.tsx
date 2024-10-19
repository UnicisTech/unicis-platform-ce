import React from 'react';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';

interface NodesSelectorProps {
  fleetTeamId: string;
  fleetAccessPhrase: string;
  onSelect: (nodeKeys: string[]) => void;
  setSectionNode: (nodeKeys: string[]) => void;
}

const NodesSelector: React.FC<NodesSelectorProps> = ({ fleetTeamId, fleetAccessPhrase, onSelect, setSectionNode }) => {

  const { nodes, isLoading, isError } = useNodes(fleetTeamId!, fleetAccessPhrase!);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const nodeOptions = nodes.map((node) => ({
    value: node.node_key,
    label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${node.host_identifier} - ${node.is_active ? '🟢 Active' : '🔴 Inactive'}`
  }));

  const handleNodeChange = (selectedOptions: any) => {
    // Extract only the values (node IDs) from the selected options
    const selectednodeKeys = selectedOptions.map((option: { value: string }) => option.value);

    // Set the selected node IDs to state
    setSectionNode(selectednodeKeys);

    // Call onSelect with the selected node IDs
    onSelect(selectednodeKeys);
  };

  return (
    <WithoutRing>
      {nodes.length === 0 ? (
        <p>No nodes found</p>
      ) : (
       <Select
        inputId="multi-select-nodes"
        className="multi-select text-sm text-red-500 ring-1 ring-red-500 rounded"
        classNamePrefix="react-select"
        options={nodeOptions}
        onChange={handleNodeChange}
        placeholder="Select a node(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default NodesSelector;
