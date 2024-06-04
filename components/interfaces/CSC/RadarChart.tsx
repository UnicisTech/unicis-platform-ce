import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
  controls,
  statusOptions,
  getRadarChartLabels,
  mergePoints,
  getSections,
} from '@/components/defaultLanding/data/configs/csc';

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
        (accumulator, control) =>
          (statusOptions.find(({ label }) => label === statuses[control])
            ?.value || 0) + accumulator,
        0
      );
      return totalControlsValue / totalControls.length;
    });
  const roundedData = data.map((value) => Math.round(value));

  if (ISO != '2013') {
    return roundedData;
  } else {
    const mergedPoints = mergePoints(roundedData);
    return mergedPoints;
  }
};

const RadarChart = ({
  statuses,
  ISO,
}: {
  statuses: { [key: string]: string };
  ISO;
}) => {
  const options = {
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 6,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };
  const data = {
    labels: getRadarChartLabels(ISO),
    datasets: [
      {
        label: 'Maturity level from 0 to 6',
        data: getMaturityLevels(statuses, ISO),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };
  return <Radar data={data} options={options} />;
};

export default RadarChart;
