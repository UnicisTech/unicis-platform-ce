import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  statusOptions,
  barColors,
  labels,
} from '@/components/defaultLanding/data/configs/csc';

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (
  statuses: { [key: string]: string },
) => statusOptions.map(({ label }) => label).map(
  (name) =>
    Object.entries(statuses).filter(([_, status]) => status === name).length
);

const PieChart = ({
  statuses,
}: {
  statuses: { [key: string]: string };
}) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: '# of Controls',
        data: countStatuses(statuses),
        backgroundColor: barColors,
        borderColor: barColors,
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

  return <Pie data={data} options={options} />;
};

export default PieChart;
