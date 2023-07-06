import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { statusOptions } from "data/configs/csc";

ChartJS.register(ArcElement, Tooltip, Legend);

const countStatuses = (statuses: { [key: string]: string; }) => {
  const labels = statusOptions.map(({ label }) => label);
  const countArray = labels.map(
    (name) =>
      Object.entries(statuses).filter(([_, status]) => status === name).length
  );
  return countArray;
};

const PieChart = ({ 
  statuses
 }: { 
  statuses: { [key: string]: string; }
}) => {
  const data = {
    labels: [
      "Unknown",
      "Not Applicable",
      "Not Performed",
      "Performed Informally",
      "Planned",
      "Well Defined",
      "Quantitatively Controlled",
      "Continuously Improving",
    ],
    datasets: [
      {
        label: "# of Controls",
        data: countStatuses(statuses),
        backgroundColor: [
          "rgba(241, 241, 241, 1)",
          "rgba(178, 178, 178, 1)",
          "rgba(255, 0, 0, 1)",
          "rgba(202, 0, 63, 1)",
          "rgba(102, 102, 102, 1)",
          "rgba(255, 190, 0, 1)",
          "rgba(106, 217, 0, 1)",
          "rgba(47, 143, 0, 1)",
        ],
        borderColor: [
          "rgba(241, 241, 241, 1)",
          "rgba(178, 178, 178, 1)",
          "rgba(255, 0, 0, 1)",
          "rgba(202, 0, 63, 1)",
          "rgba(102, 102, 102, 1)",
          "rgba(255, 190, 0, 1)",
          "rgba(106, 217, 0, 1)",
          "rgba(47, 143, 0, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Controls",
      },
    },
    maintainAspectRatio: false,
    responsive: true
  };

  countStatuses(statuses);

  return <Pie data={data} options={options}/>;
};

export default PieChart;
