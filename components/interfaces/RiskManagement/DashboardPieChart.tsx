import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import useTheme from 'hooks/useTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

const lightColors = [
  'rgba(211, 211, 211, 0.5)',
  'rgba(0, 255, 0, 0.3)',
  'rgba(255, 255, 0, 0.3)',
  'rgba(255, 165, 0, 0.3)',
  'rgba(255, 0, 0, 0.3)',
];
const darkColors = [
  'rgba(161, 161, 170, 1)',
  'rgba(52, 211, 153, 1)',
  'rgba(251, 191, 36, 1)',
  'rgba(251, 146, 60, 1)',
  'rgba(239, 68, 68, 1)',
];

const lightText = '#1f2937';
const darkText = '#f3f4f6';

const DashboardChart = ({ datasets }: { datasets: number[] }) => {
  const { theme } = useTheme();

  console.log('theme', theme);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const textColor = isDark ? darkText : lightText;

  const data = {
    labels: ['Insignificant', 'Minor', 'Moderate', 'Major', 'Extreme'],
    datasets: [
      {
        label: 'Risk count',
        data: datasets,
        backgroundColor: colors,
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: 'Controls',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return <Pie data={data} options={options} />;
};

export default DashboardChart;
