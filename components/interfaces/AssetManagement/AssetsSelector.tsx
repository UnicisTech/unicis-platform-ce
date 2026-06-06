import React, { useEffect, useMemo, useState } from 'react';
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
  const availableNodes = useMemo(() => nodes ?? [], [nodes]);

  useEffect(() => {
    if (availableNodes.length > 0 && preSelectedNode.length > 0) {
      const initialSelectedKeys = availableNodes
        .filter((node) =>
          preSelectedNode.some((preNode) => preNode.id === node.id)
        )
        .map((node) => node.node_key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedNodeKeys(initialSelectedKeys);
    }
  }, [availableNodes, preSelectedNode]);

  if (isLoading) return <p>{t('loading')}</p>;
  if (isError) return <p>{t('error-loading-assets')}</p>;

  const nodeOptions = availableNodes.map((node) => ({
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
      {availableNodes.length === 0 ? (
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
