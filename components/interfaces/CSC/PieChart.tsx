import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  statusOptions,
  taskStatusOptions,
} from '@/components/defaultLanding/data/configs/csc';
import { UnicisPages } from 'types';

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (
  statuses: { [key: string]: string },
  page_name: UnicisPages
) => {
  let labels;

  if (page_name === 'task') {
    labels = taskStatusOptions.map(({ label }) => label);
  } else {
    labels = statusOptions.map(({ label }) => label);
  }
  const countArray = labels.map(
    (name) =>
      Object.entries(statuses).filter(([_, status]) => status === name).length
  );

  return countArray;
};

const PieChart = ({
  statuses,
  barColor,
  labels,
  page_name,
}: {
  page_name: UnicisPages;
  statuses: { [key: string]: string };
  barColor: any[];
  labels: any[];
}) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: '# of Controls',
        data: countStatuses(statuses, page_name),
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

  countStatuses(statuses, page_name);

  return <Pie data={data} options={options} />;
};

export default PieChart;
