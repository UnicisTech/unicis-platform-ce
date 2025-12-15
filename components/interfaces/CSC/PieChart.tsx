import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { CSC_STATUSES, CscStatus } from '@/lib/csc/csc-statuses';
import { CscStatusesMap } from 'types';
import { useTranslation } from 'next-i18next';

// TODO: use css vars
const barColors = [
  'rgba(241, 241, 241, 1)',
  'rgba(178, 178, 178, 1)',
  'rgba(255, 0, 0, 1)',
  'rgba(202, 0, 63, 1)',
  'rgba(102, 102, 102, 1)',
  'rgba(255, 190, 0, 1)',
  'rgba(106, 217, 0, 1)',
  'rgba(47, 143, 0, 1)',
];

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (statuses: CscStatusesMap): number[] => {
  const counters: Record<CscStatus, number> = Object.fromEntries(
    CSC_STATUSES.map((s) => [s, 0])
  ) as Record<CscStatus, number>;

  for (const status of Object.values(statuses)) {
    if (CSC_STATUSES.includes(status as CscStatus)) {
      counters[status as CscStatus] += 1;
    }
  }

  return CSC_STATUSES.map((s) => counters[s]);
};

const PieChart = ({ statuses }: { statuses: CscStatusesMap }) => {
  const { t } = useTranslation();
  const labels = CSC_STATUSES.map((status) => t(`statuses.${status}.label`));
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
      legend: { position: 'top' },
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
