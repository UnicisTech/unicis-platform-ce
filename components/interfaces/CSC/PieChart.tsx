import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { statusOptions, taskStatusOptions } from '@/components/defaultLanding/data/configs/csc';
import { UnicisPages } from 'types';

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (
  statuses: { [key: string]: string; },
  page_name: UnicisPages
) => {
  let labels;

  if (page_name === 'task') {
    labels = taskStatusOptions.map(({ label }) => label);
  } else{
    labels = statusOptions.map(({ label }) => label);
  }
  const countArray = labels.map(
    (name) =>
      Object.entries(statuses).filter(([_, status]) => status === name).length
  );

  return countArray;
};

const PieChart = ({ statuses, labels, page_name }: {page_name: UnicisPages, statuses: { [key: string]: string }, labels: any[] }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: '# of Controls',
        data: countStatuses(statuses, page_name),
        backgroundColor: [
          'rgba(241, 241, 241, 1)',
          'rgba(178, 178, 178, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(202, 0, 63, 1)',
          'rgba(102, 102, 102, 1)',
          'rgba(255, 190, 0, 1)',
          'rgba(106, 217, 0, 1)',
          'rgba(47, 143, 0, 1)',
        ],
        borderColor: [
          'rgba(241, 241, 241, 1)',
          'rgba(178, 178, 178, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(202, 0, 63, 1)',
          'rgba(102, 102, 102, 1)',
          'rgba(255, 190, 0, 1)',
          'rgba(106, 217, 0, 1)',
          'rgba(47, 143, 0, 1)',
        ],
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
