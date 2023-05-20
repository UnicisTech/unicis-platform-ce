import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { sections, controls, statusOptions } from "data/configs/csc";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const getMaturityLevels = (statuses: { [key: string]: string; }) => {
  if (typeof statusOptions === "undefined") {
    return
  }
  const data = sections
    .map(({ label }) => label)
    .map((label) => {
      const totalControls = controls
        .filter(({ Section }) => Section === label)
        .map(({ Control }) => Control);
      const totalControlsValue = totalControls.reduce(
        (accumulator, control) =>
          statusOptions.find(({ label }) => label === statuses[control])?.value! + accumulator,
        0
      );
      return totalControlsValue / totalControls.length;
    });
  const roundedData = data.map((value) => Math.round(value));
  return roundedData;
};

const RadarChart = ({
  statuses
}: {
  statuses: { [key: string]: string; }
}) => {
  getMaturityLevels(statuses);
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
    maintainAspectRatio: false
  };
  const data = {
    labels: sections.map(({ label }) => label).map((label) => label.split(" ")),
    datasets: [
      {
        label: "Maturity level from 0 to 6",
        data: getMaturityLevels(statuses),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  return <Radar data={data} options={options}/>;
};

export default RadarChart;
