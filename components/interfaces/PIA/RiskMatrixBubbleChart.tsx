import React from 'react';
import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';

const riskColors = {
  low: 'rgba(0, 255, 0, 0.3)',
  medium: 'rgba(255, 255, 0, 0.3)',
  high: 'rgba(255, 165, 0, 0.3)',
  extreme: 'rgba(255, 0, 0, 0.3)',
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
);

const impactLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Extreme'];

const probabilityLabels = [
  'Rare',
  'Unlikely',
  'Possible',
  'Probable',
  '(Almost) certain',
];

const RiskMatrixBubbleChart = ({ datasets }: any) => {
  const adjustedDatasets = datasets.map((dataset: any) => ({
    ...dataset,
    data: dataset.data.map((point: any) => ({
      ...point,
      x: point.x + 0.5,
      y: point.y + 0.5
    })),
  }));

  const data = {
    datasets: adjustedDatasets,
  };

  const options: any = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Risk impact',
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 0.5,
          display: true,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            if (labelIndex % 2 === 0) {
              return impactLabels[Math.floor(labelIndex / 2)];
            } else {
              return '';
            }
          },
        },
        position: 'bottom',
      },
      y: {
        title: {
          display: true,
          text: 'Risk probability',
        },
        min: 0,
        max: 5,
        reverse: false,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            if (labelIndex % 2 === 0) {
              return probabilityLabels[Math.floor(labelIndex / 2)];
            } else {
              return '';
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
    },
  };

  const backgroundPlugin = {
    id: 'backgroundPlugin',
    beforeDraw: (chart) => {
      const { ctx, scales } = chart;

      const cellColors = [
        { x: 0, y: 0, color: riskColors.low },
        { x: 0, y: 1, color: riskColors.low },
        { x: 0, y: 2, color: riskColors.low },
        { x: 0, y: 3, color: riskColors.medium },
        { x: 0, y: 4, color: riskColors.medium },
        { x: 1, y: 0, color: riskColors.low },
        { x: 1, y: 1, color: riskColors.low },
        { x: 1, y: 2, color: riskColors.medium },
        { x: 1, y: 3, color: riskColors.medium },
        { x: 1, y: 4, color: riskColors.high },
        { x: 2, y: 0, color: riskColors.low },
        { x: 2, y: 1, color: riskColors.medium },
        { x: 2, y: 2, color: riskColors.medium },
        { x: 2, y: 3, color: riskColors.high },
        { x: 2, y: 4, color: riskColors.high },
        { x: 3, y: 0, color: riskColors.medium },
        { x: 3, y: 1, color: riskColors.medium },
        { x: 3, y: 2, color: riskColors.high },
        { x: 3, y: 3, color: riskColors.high },
        { x: 3, y: 4, color: riskColors.extreme },
        { x: 4, y: 0, color: riskColors.medium },
        { x: 4, y: 1, color: riskColors.high },
        { x: 4, y: 2, color: riskColors.high },
        { x: 4, y: 3, color: riskColors.extreme },
        { x: 4, y: 4, color: riskColors.extreme },
      ];

      ctx.save();
      cellColors.forEach(({ x, y, color }) => {
        const left = scales.x.getPixelForValue(x);
        const right = scales.x.getPixelForValue(x + 1);
        const top = scales.y.getPixelForValue(y);
        const bottom = scales.y.getPixelForValue(y + 1);

        ctx.fillStyle = color;
        ctx.fillRect(left, top, right - left, bottom - top);
      });
      ctx.restore();
    },
  };

  return <Bubble data={data} options={options} plugins={[backgroundPlugin]} />;
};

export default RiskMatrixBubbleChart;
