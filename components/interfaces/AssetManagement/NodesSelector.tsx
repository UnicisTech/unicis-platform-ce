import React from 'react';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';


interface NodesSelectorProps {
    fleetTeamId: string;
    fleetAccessPhrase: string;
    onSelect: (nodeId: string) => void;
}

const NodesSelector: React.FC<NodesSelectorProps> = ({ fleetTeamId, fleetAccessPhrase, onSelect }) => {

  const { nodes, isLoading, isError } = useNodes(fleetTeamId!, fleetAccessPhrase!, status);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{isError}</p>;

  return (
    <div>
      {nodes.length === 0 ? (
        <p>No nodes found</p>
      ) : (
        <ul className="node-list">
          {nodes.map((node) => (
            <li
              key={node.node_key}
              className="node-item border p-2 mb-2 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelect(node.node_key)}
            >
              <div>
                <strong>Node Key:</strong> {node.node_key}
              </div>
              <div>
                <strong>Host Identifier:</strong> {node.host_identifier || 'N/A'}
              </div>
              <div>
                <strong>Last IP:</strong> {node.last_ip || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {node.is_active ? 'Active' : 'Inactive'}
              </div>
              <div>
                <strong>Last Check-in:</strong> {node.last_checkin || 'N/A'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NodesSelector;
