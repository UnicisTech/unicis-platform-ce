import React from 'react';
import { useTranslation } from 'next-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { statuses as taskStatuses } from '@/lib/tasks';

// TODO: move to config + use css variables
const barColors = [
  'rgb(232, 232, 232)', // todo
  'rgb(123, 146, 178)', // in progress
  'rgb(77, 110, 255)', // in review
  'rgb(0, 181, 255)', // feedback
  'rgb(0, 169, 110)', // done
  'rgb(239, 68, 68)', // failed
];

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (statuses: { [key: string]: string }) =>
  taskStatuses.map(
    (name) =>
      Object.entries(statuses).filter(([_, status]) => status === name).length
  );

const TasksPieChart = ({
  statuses,
}: {
  statuses: { [key: string]: string };
}) => {
  const { t } = useTranslation('common');
  const data = {
    labels: taskStatuses.map((status) => t(`task-statuses.${status}`)),
    datasets: [
      {
        label: t('tasks-count'),
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
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

  return <div className="w-full h-full"><Pie data={data} options={options} /></div>;
};

export default TasksPieChart;
