import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const labels = ['Wrong', 'Right'];

const colors = ['rgba(255, 0, 0, 1)', 'rgba(47, 143, 0, 1)'];

const UserResultPieChart = ({
  right,
  wrong,
}: {
  right: number;
  wrong: number;
}) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Answers',
        data: [wrong, right],
        backgroundColor: colors,
        borderColor: colors,
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

export default UserResultPieChart;
