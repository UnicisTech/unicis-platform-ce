import React, { useEffect, useState } from 'react';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { Node } from '@/types';
import { MultiSelect } from '@/components/shadcn/ui/multi-select'; // твій кастомний MultiSelect

interface AssetsSelectorProps {
  fleetTeamId: string;
  onSelect: (nodeKeys: string[]) => void;
  setSectionNode: (nodeKeys: string[]) => void;
  preSelectedNode?: Node[];
}

const NodesSelector: React.FC<AssetsSelectorProps> = ({
  fleetTeamId,
  onSelect,
  setSectionNode,
  preSelectedNode = [],
}) => {
  const { nodes, isLoading, isError } = useNodes(fleetTeamId!);
  const [selectedNodeKeys, setSelectedNodeKeys] = useState<string[]>([]);

  useEffect(() => {
    if (nodes && preSelectedNode.length > 0) {
      const initialSelectedKeys = nodes
        .filter((node) =>
          preSelectedNode.some((preNode) => preNode.id === node.id),
        )
        .map((node) => node.node_key);
      setSelectedNodeKeys(initialSelectedKeys);
    }
  }, [nodes, preSelectedNode]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{String(isError)}</p>;

  const nodeOptions = nodes.map((node) => ({
    value: node.node_key,
    label: `${node.node_info?.system_info?.computer_name || 'Unknown Host'} - ${
      node.host_identifier
    } - owner: ${node.owner.user.name} - ${
      node.is_active ? '🟢 Active' : '🔴 Inactive'
    }`,
  }));

  const handleAssetChange = (values: string[]) => {
    setSelectedNodeKeys(values);
    setSectionNode(values);
    onSelect(values);
  };

  return (
    <div className="w-full">
      {nodes.length === 0 ? (
        <p>No assets found</p>
      ) : (
        <MultiSelect
          options={nodeOptions}
          defaultValue={selectedNodeKeys}
          onValueChange={handleAssetChange}
          placeholder="Select Asset(s)"
          className="w-full"
          maxCount={3}
        />
      )}
    </div>
  );
};

export default NodesSelector;
