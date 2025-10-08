import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { taskStatusOptions } from '@/components/defaultLanding/data/configs/csc';

// TODO: move to config + use css variables
const barColors = [
  'rgb(232, 232, 232)', // todo
  'rgb(123, 146, 178)', // in progress
  'rgb(77, 110, 255)', // in review
  'rgb(0, 181, 255)', // feedback
  'rgb(0, 169, 110)', // done
];

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (statuses: { [key: string]: string }) =>
  taskStatusOptions
    .map(({ label }) => label)
    .map(
      (name) =>
        Object.entries(statuses).filter(([_, status]) => status === name).length
    );

const TasksPieChart = ({
  statuses,
  labels,
}: {
  statuses: { [key: string]: string };
  labels: any[];
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

export default TasksPieChart;
