import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  controls,
  statusOptions,
  getRadarChartLabels,
  mergePoints,
  getSections,
} from '@/components/defaultLanding/data/configs/csc';
import useTheme from 'hooks/useTheme';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const getMaturityLevels = (
  statuses: { [key: string]: string },
  ISO: string
) => {
  const sections = getSections(ISO);
  const data = sections
    .map(({ label }) => label)
    .map((label) => {
      const totalControls = controls[ISO].filter(
        ({ Section }) => Section === label
      ).map(({ Control }) => Control);
      const totalControlsValue = totalControls.reduce(
        (acc, control) =>
          (statusOptions.find(({ label }) => label === statuses[control])
            ?.value || 0) + acc,
        0
      );
      return totalControlsValue / totalControls.length;
    });

  return ISO === '2013'
    ? mergePoints(data.map(Math.round))
    : data.map(Math.round);
};

const RadarChart = ({
  statuses,
  ISO,
}: {
  statuses: { [key: string]: string };
  ISO: string;
}) => {
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#0f172a';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const lineColor = isDark ? '#3b82f6' : '#2563eb';

  const data = {
    labels: getRadarChartLabels(ISO),
    datasets: [
      {
        label: 'Maturity level (0–6)',
        data: getMaturityLevels(statuses, ISO),
        backgroundColor: `${lineColor}33`,
        borderColor: lineColor,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 6,
        ticks: {
          color: textColor,
          backdropColor: 'transparent',
        },
        pointLabels: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        angleLines: {
          color: gridColor,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return <Radar data={data} options={options} />;
};

export default RadarChart;
