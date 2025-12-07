import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { Node } from '@/types';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';

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
  const { t } = useTranslation('common');
  const { nodes, isLoading, isError } = useNodes(fleetTeamId!);
  const [selectedNodeKeys, setSelectedNodeKeys] = useState<string[]>([]);

  useEffect(() => {
    if (nodes && preSelectedNode.length > 0) {
      const initialSelectedKeys = nodes
        .filter((node) =>
          preSelectedNode.some((preNode) => preNode.id === node.id)
        )
        .map((node) => node.node_key);
      setSelectedNodeKeys(initialSelectedKeys);
    }
  }, [nodes, preSelectedNode]);

  if (isLoading) return <p>{t('loading')}</p>;
  if (isError) return <p>{t('error-loading-assets')}</p>;

  const nodeOptions = nodes.map((node) => ({
    value: node.node_key,
    label: `${node.node_info?.system_info?.computer_name || t('unknown-host')} - ${
      node.host_identifier
    } - ${t('owner')}: ${node.owner.user.name} - ${
      node.is_active ? t('active-green') : t('inactive-red')
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
        <p>{t('no-assets-found')}</p>
      ) : (
        <MultiSelect
          options={nodeOptions}
          defaultValue={selectedNodeKeys}
          onValueChange={handleAssetChange}
          placeholder={t('select-assets')}
          className="w-full"
          maxCount={3}
        />
      )}
    </div>
  );
};

export default NodesSelector;
