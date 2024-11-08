import React from 'react';
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
  const data = {
    labels: labels,
    datasets: [
      {
        label: '# of Host(s)',
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
        text: 'Controls',
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return <Doughnut data={data} options={options} />;
};

export default AssetPieChart;
