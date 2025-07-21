import React, { useRef, useEffect, useState } from 'react';
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

const impactLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Extreme'];
const probabilityLabels = ['Rare', 'Unlikely', 'Possible', 'Probable', '(Almost) certain'];

ChartJS.register(CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip);

const CELL_SIZE = 60;
const MATRIX_SIZE = 5;

const riskColors = {
  low: 'rgba(0, 255, 0, 0.3)',
  medium: 'rgba(255, 255, 0, 0.3)',
  high: 'rgba(255, 165, 0, 0.3)',
  extreme: 'rgba(255, 0, 0, 0.3)',
};

const RiskMatrixDashboardChart = ({ datasets, counterMap }: any) => {
  const chartRef = useRef<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const chartWidth = CELL_SIZE * MATRIX_SIZE * 1.5;
  const chartHeight = CELL_SIZE * MATRIX_SIZE;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Treated impact' },
        min: 0,
        max: MATRIX_SIZE,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            return labelIndex % 2 === 0 ? impactLabels[Math.floor(labelIndex / 2)] : '';
          },
        },
      },
      y: {
        title: { display: true, text: 'Treated probability' },
        min: 0,
        max: MATRIX_SIZE,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            return labelIndex % 2 === 0 ? probabilityLabels[Math.floor(labelIndex / 2)] : '';
          },
        },
        reverse: false,
      },
    },
    plugins: { legend: { display: false } },
  };

  const backgroundPlugin = {
    id: 'backgroundPlugin',
    beforeDraw: (chart) => {
      const { ctx, scales } = chart;
      const cellColors = [
        { x: 0, y: 0, color: riskColors.low }, { x: 0, y: 1, color: riskColors.low },
        { x: 0, y: 2, color: riskColors.low }, { x: 0, y: 3, color: riskColors.medium },
        { x: 0, y: 4, color: riskColors.medium }, { x: 1, y: 0, color: riskColors.low },
        { x: 1, y: 1, color: riskColors.low }, { x: 1, y: 2, color: riskColors.medium },
        { x: 1, y: 3, color: riskColors.medium }, { x: 1, y: 4, color: riskColors.high },
        { x: 2, y: 0, color: riskColors.low }, { x: 2, y: 1, color: riskColors.medium },
        { x: 2, y: 2, color: riskColors.medium }, { x: 2, y: 3, color: riskColors.high },
        { x: 2, y: 4, color: riskColors.high }, { x: 3, y: 0, color: riskColors.medium },
        { x: 3, y: 1, color: riskColors.medium }, { x: 3, y: 2, color: riskColors.high },
        { x: 3, y: 3, color: riskColors.high }, { x: 3, y: 4, color: riskColors.extreme },
        { x: 4, y: 0, color: riskColors.medium }, { x: 4, y: 1, color: riskColors.high },
        { x: 4, y: 2, color: riskColors.high }, { x: 4, y: 3, color: riskColors.extreme },
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

  useEffect(() => {
    const chartInstance = chartRef.current?.chartInstance || chartRef.current;
    if (chartInstance) {
      const scales = chartInstance.scales;
      const newPoints = Array.from({ length: 5 }, (_, x) =>
        Array.from({ length: 5 }, (_, y) => ({
          x: scales.x.getPixelForValue(x + 0.5),
          y: scales.y.getPixelForValue(y + 0.5),
          value: counterMap.get(`${x},${y}`) || 0,
        }))
      ).flat();
      setPoints(newPoints);
    }
  }, [datasets]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${chartWidth}px`,
        height: `${chartHeight}px`,
        margin: 'auto',
      }}
    >
      <Bubble
        ref={chartRef}
        data={{ datasets }}
        options={options}
        plugins={[backgroundPlugin]}
      />
      {points.map((point, index) => (
        <div
          key={index}
          className="absolute flex items-center justify-center rounded-md text-sm font-semibold text-black dark:text-white bg-white/80 dark:bg-black/70 shadow"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            transform: 'translate(-50%, -50%)',
            width: `${CELL_SIZE * 0.7}px`,
            height: `${CELL_SIZE * 0.6}px`,
          }}
        >
          {point.value}
        </div>
      ))}
    </div>
  );
};

export default RiskMatrixDashboardChart;