// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

import React, { useEffect, useState } from 'react';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { WithoutRing } from 'sharedStyles';
import Select from '@atlaskit/select';
import { Node } from '@/types';

interface AssetsSelectorProps {
  fleetTeamId: string;
  onSelect: (nodeKeys: string[]) => void;
  setSectionNode: (nodeKeys: string[]) => void;
  preSelectedNode?: Node[];
}

const NodesSelector: React.FC<AssetsSelectorProps> = ({ fleetTeamId, onSelect, setSectionNode, preSelectedNode = [] }) => {

  const { nodes, isLoading, isError } = useNodes(fleetTeamId!);
  const [selectedNodeOptions, setSelectedNodeOptions] = useState<any[]>([]);

  useEffect(() => {
    if (nodes && preSelectedNode.length > 0) {
      const initialSelectedOptions = nodes
        .filter(node => preSelectedNode.some(preNode => preNode.id === node.id))
        .map((node) => ({
          value: node.node_key,
          label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${node.host_identifier} - owner: ${node.owner.user.name} - ${node.is_active ? '🟢 Active' : '🔴 Inactive'}`
        }));
      setSelectedNodeOptions(initialSelectedOptions);
    }
  }, [nodes, preSelectedNode]);
  
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  const nodeOptions = nodes.map((node) => ({
    value: node.node_key,
    label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${node.host_identifier} - owner: ${node.owner.user.name} - ${node.is_active ? '🟢 Active' : '🔴 Inactive'}`
  }));

  const handleAssetChange = (selectedOptions: any) => {
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
        inputId="multi-select-assets"
        className="multi-select text-sm ring-1 rounded"
        classNamePrefix="react-select"
        options={nodeOptions}
        onChange={handleAssetChange}
        value={selectedNodeOptions}
        placeholder="Select Asset(s)"
        isMulti
      />
      )}
    </WithoutRing>
  );
};

export default NodesSelector;
