import React from 'react';
import { useTranslation } from 'next-i18next';
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
import frameworks from '@/lib/csc/frameworks';
import useTheme from 'hooks/useTheme';
import { ISO } from 'types';
import { removeTrailingParenthesis, truncateText } from '@/lib/utils';
import { CSC_STATUS_TO_VALUE } from '@/lib/csc/csc-statuses';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const getRadarChartLabels = (iso: ISO, labels: string[]) => {
  return labels.map((label) => {
    let processedLabel: string;

    switch (iso) {
      case 'c5_2020':
        processedLabel = removeTrailingParenthesis(label);
        break;
      default:
        processedLabel = label;
    }

    processedLabel = truncateText(processedLabel, 25);

    return processedLabel.split(' ');
  });
};

const mergePoints = (d) => {
  const merged = [
    d[0],
    (d[1] + d[2]) / 2,
    (d[3] + d[4] + d[5]) / 3,
    (d[6] + d[7] + d[8]) / 3,
    (d[9] + d[10] + d[11] + d[12]) / 4,
    d[13],
    (d[14] + d[15]) / 2,
    (d[16] + d[17] + d[18] + d[19] + d[20] + d[21] + d[22]) / 7,
    (d[23] + d[24]) / 2,
    (d[25] + d[26] + d[27]) / 3,
    (d[28] + d[29]) / 2,
    d[30],
    (d[31] + d[32]) / 2,
    (d[33] + d[34]) / 2,
  ];

  const rounded = merged.map((value) => Math.round(value));

  return rounded;
};

const getMaturityLevels = (statuses: Record<string, string>, iso: ISO) => {
  const { sections, controls } = frameworks[iso];

  const rawLevels = sections.map((section) => {
    const sectionControls = controls.filter(
      (control) => control.sectionId === section.id
    );

    if (sectionControls.length === 0) return 0;

    const totalValue = sectionControls.reduce((sum, control) => {
      const status = statuses[control.id];
      return sum + (CSC_STATUS_TO_VALUE[status] ?? 0);
    }, 0);

    return totalValue / sectionControls.length;
  });

  const rounded = rawLevels.map(Math.round);

  return iso === '2013' ? mergePoints(rounded) : rounded;
};

const RadarChart = ({
  statuses,
  ISO,
}: {
  statuses: { [key: string]: string };
  ISO: ISO;
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const labels = getRadarChartLabels(
    ISO,
    frameworks[ISO].sections
      .map((sections) => sections.id)
      .map((sectionId) => t(`csc/${ISO}:sections.${sectionId}.label`))
  );
  const pointsData = getMaturityLevels(statuses, ISO);

  // TODO: move to css variables?
  const textColor = isDark ? '#e5e7eb' : '#0f172a';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const lineColor = isDark ? '#3b82f6' : '#2563eb';

  const data = {
    labels: labels,
    datasets: [
      {
        label: t('maturity-level-0-6'),
        data: pointsData,
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
          font: {
            size: 9,
          },
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

  return (
    <div
      role="img"
      aria-label={t('chart.csc-radar-aria-label', {
        defaultValue:
          'Radar chart showing compliance score per framework section',
      })}
      className="w-full h-full"
    >
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
