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
import { useTranslation } from 'next-i18next';
import { impactLabelKeys, probabilityLabelKeys } from '@/lib/common';
import useTheme from 'hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
);

const MATRIX_SIZE = 5;

const riskColors = {
  low: 'rgba(0, 255, 0, 0.3)',
  medium: 'rgba(255, 255, 0, 0.3)',
  high: 'rgba(255, 165, 0, 0.3)',
  extreme: 'rgba(255, 0, 0, 0.3)',
};

const RiskMatrixDashboardChart = ({
  datasets,
  counterMap,
  cellSize = 55,
}: any) => {
  const { t } = useTranslation('common');
  const { isDark } = useTheme();
  const chartRef = useRef<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const chartWidth = cellSize * MATRIX_SIZE * 1.5;
  const chartHeight = cellSize * MATRIX_SIZE;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: t('risk-impact') },
        min: 0,
        max: MATRIX_SIZE,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            return labelIndex % 2 === 0
              ? t(impactLabelKeys[Math.floor(labelIndex / 2)])
              : '';
          },
        },
      },
      y: {
        title: { display: true, text: t('risk-probability') },
        min: 0,
        max: MATRIX_SIZE,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            const labelIndex = Math.round(value * 2) - 1;
            return labelIndex % 2 === 0
              ? t(probabilityLabelKeys[Math.floor(labelIndex / 2)])
              : '';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPoints(newPoints);
    }
  }, [counterMap, datasets]);

  return (
    <div
      className="relative mx-auto"
      style={{
        width: `${chartWidth}px`,
        height: `${chartHeight}px`,
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
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md text-sm font-semibold text-black shadow"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${cellSize * 0.8}px`,
            height: `${cellSize * 0.6}px`,
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.85)',
            border: isDark
              ? '1px solid rgba(0, 0, 0, 0.15)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          {point.value}
        </div>
      ))}
    </div>
  );
};

export default RiskMatrixDashboardChart;
