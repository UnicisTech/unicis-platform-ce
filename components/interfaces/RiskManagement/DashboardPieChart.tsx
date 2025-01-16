import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// const barColors = [
//     'rgba(1, 107, 1)',
//     'rgba(72, 135, 0)',
//     'rgba(255, 176, 5)',
//     'rgba(255, 111, 3)',
//     'rgb(254, 1, 0)',
//   ];

const barColors = [
  'rgba(47, 143, 0, 1)',
  'rgba(106, 217, 0, 1)',
  'rgba(255, 190, 0, 1)',
  'rgba(255, 111, 3)',
  'rgba(255, 0, 0, 1)',
];

const DashboardChart = ({
  datasets
}: {
  datasets: number[]
}) => {
  const data = {
    labels: [
      'Insignificant',
      'Minor',
      'Moderate',
      'Major',
      'Extreme',
    ],
    datasets: [
      {
        label: 'Risk count',
        data: datasets,
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

export default DashboardChart;
