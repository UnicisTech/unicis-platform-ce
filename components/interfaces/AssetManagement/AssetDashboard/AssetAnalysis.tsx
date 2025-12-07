import AssetCard from '@/components/interfaces/AssetManagement/AssetDashboard/AssetCard'
import React from 'react'
import { Team, User } from '@prisma/client';
import AssetPieChart from './AssetPieChart';
import { defaultLabels } from '@/lib/fleet/constants';
import { Node } from '@/types';

interface Assets {
  team: Team,
  user: Partial<User>
  nodes: Node[],
}

const platformColors: { [key: string]: string } = {
  windows: 'rgb(0, 181, 255)',
  linux: 'rgb(123, 146, 178)',
  apple: 'rgb(0, 169, 110)',
};

const AssetsAnalysis = ({ team, user, nodes }: Assets) => {

  const platformCounts: { [key: string]: number } =
    nodes?.reduce((acc: { [key: string]: number }, node) => {
      const platform = node.node_info?.osquery_info.build_platform?.toLowerCase();
      if (platform && node.is_active) {
        acc[platform] = (acc[platform] || 0) + 1;
      }
      return acc;
    }, {}) || {};

  const labels = Array.from(
    new Set([
      ...defaultLabels,
      ...Object.keys(platformCounts).map((key) => key.charAt(0).toUpperCase() + key.slice(1)),
    ])
  );

  const platformsData = labels.map((platform) => ({
    platform: platform.toLowerCase(),
    total: platformCounts[platform.toLowerCase()] || 0,
  }));

  // const platformsData = Object.entries(platformCounts).map(([platform, total]) => ({ //TODO I createt this two use this if prefired
  //   platform,
  //   total
  // }));

  const barColors = labels.map(label => {
    const platformKey = label.toLowerCase();
    return platformColors[platformKey] || 'rgb(200, 200, 200)';
  });

  const hostData = labels.map(label => {
    const platformKey = label.toLowerCase();
    return platformCounts[platformKey] || 0;
  });


  return (
    <>
      <div
        style={{
          height: '400px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <div
          style={{ width: '49%' }}
          className="stats py-2 stat-value shadow"
        >
          <AssetPieChart
            hostData={hostData}
            barColor={barColors}
            labels={labels}
          />
        </div>
        <div style={{ width: '49%' }} className="shadow p-4 overflow-y-auto">
          <div className='grid grid-cols-1 gap-4'>
            {platformsData.map((asset, index) =>
              <AssetCard key={index} host={asset.platform} total={asset.total} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AssetsAnalysis