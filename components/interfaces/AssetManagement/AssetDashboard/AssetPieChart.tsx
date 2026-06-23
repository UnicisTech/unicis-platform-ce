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
        position: 'right',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          font: { size: 11 },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const value = context.parsed;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${context.label}: ${value} (${pct}%)`;
          },
        },
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
