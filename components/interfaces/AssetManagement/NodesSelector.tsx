import React, { useEffect, useState } from 'react';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { Node } from '@/types';

interface NodesSelectorProps {
  fleetTeamId: string;
  fleetAccessPhrase: string;
  onSelect: (nodeKeys: string[]) => void;
  setSectionNode: (nodeKeys: string[]) => void;
  preSelectedNode?: Node[];
}

const NodesSelector: React.FC<NodesSelectorProps> = ({ fleetTeamId, fleetAccessPhrase, onSelect, setSectionNode, preSelectedNode = [] }) => {

  const { nodes, isLoading, isError } = useNodes(fleetTeamId!, fleetAccessPhrase!);
  const [selectedNodeOptions, setSelectedNodeOptions] = useState<any[]>([]);

  useEffect(() => {
    if (nodes && preSelectedNode.length > 0) {
      const initialSelectedOptions = nodes
        .filter(node => preSelectedNode.some(preNode => preNode.id === node.id))
        .map((node) => ({
          value: node.node_key,
          label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${node.host_identifier} - ${node.is_active ? '🟢 Active' : '🔴 Inactive'}`
        }));
      setSelectedNodeOptions(initialSelectedOptions);
    }
  }, [nodes, preSelectedNode]);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const nodeOptions = nodes.map((node) => ({
    value: node.node_key,
    label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${node.host_identifier} - ${node.is_active ? '🟢 Active' : '🔴 Inactive'}`
  }));

  const handleNodeChange = (selectedOptions: any) => {
    const selectedNodeKeys = selectedOptions.map((option: { value: string }) => option.value);

    setSelectedNodeOptions(selectedOptions);
    setSectionNode(selectedNodeKeys);
    onSelect(selectedNodeKeys);
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
            value={selectedNodeOptions}
        placeholder="Select a node(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default NodesSelector;
