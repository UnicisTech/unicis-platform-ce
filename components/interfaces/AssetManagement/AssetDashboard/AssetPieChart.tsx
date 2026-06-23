import React from 'react';
import { useTranslation } from 'next-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AssetPieChart = ({
  hostData,
  barColor,
  labels,
}: {
  hostData: number[];
  barColor: any[];
  labels: string[];
}) => {
  const { t } = useTranslation('fleet');
  const title = t('assets-by-platform', { defaultValue: 'Assets by platform' });

  const data = {
    labels: labels,
    datasets: [
      {
        label: t('fleet-hosts-count-short', { defaultValue: 'Hosts' }),
        data: hostData,
        backgroundColor: barColor,
        borderColor: barColor,
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div role="img" aria-label={title} className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default AssetPieChart;
