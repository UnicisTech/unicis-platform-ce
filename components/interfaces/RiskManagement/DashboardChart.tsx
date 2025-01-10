import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const BarChart = ({ data }) => {
  const chartData = {
    labels: ['0% - 20%', '20% - 40%', '40% - 60%', '60% - 80%', '80% - 100%'],
    datasets: [
      {
        label: 'Count',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        offset: true,
        title: {
          display: true,
          text: 'Current risk rating',
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Risk count',
        },
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: { legend: { display: false } }
  };
  

  return (
    <div style={{ height: '400px'}}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
