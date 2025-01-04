// import React from "react";
// import { Bubble } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Legend,
//   Title,
//   Tooltip,
// } from "chart.js";

// const riskColors = {
//   low: "rgba(0, 255, 0, 0.3)",
//   medium: "rgba(255, 255, 0, 0.3)",
//   high: "rgba(255, 165, 0, 0.3)",
//   extreme: "rgba(255, 0, 0, 0.3)",
// }

// const MATRIX_SIZE = 5; // 5x5 matrix

// ChartJS.register(CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip);

// const RiskMatrixBubbleChart = ({ datasets }: any) => {
//   const data = {
//     datasets
//   };

//   const options: any = {
//     responsive: true,
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Impact of the Risk",
//         },
//         min: 0,
//         max: 5,
//         ticks: {
//           stepSize: 1,
//           callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
//         },
//         position: 'bottom'
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Probability of the Risk",
//         },
//         min: 0,
//         max: 5,
//         reverse: false,
//         ticks: {
//           stepSize: 1,
//           callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: false,
//         position: "top" as const,
//       },
//     },
//   };

//   const backgroundPlugin = {
//     id: "backgroundPlugin",
//     beforeDraw: (chart) => {
//       const { ctx, scales } = chart;

//       // Define the colors for each cell in the matrix
//       const cellColors = [
//         { x: 0, y: 0, color: riskColors.low },
//         { x: 0, y: 1, color: riskColors.low },
//         { x: 0, y: 2, color: riskColors.low },
//         { x: 0, y: 3, color: riskColors.medium },
//         { x: 0, y: 4, color: riskColors.medium },
//         { x: 1, y: 0, color: riskColors.low },
//         { x: 1, y: 1, color: riskColors.low },
//         { x: 1, y: 2, color: riskColors.medium },
//         { x: 1, y: 3, color: riskColors.medium },
//         { x: 1, y: 4, color: riskColors.high },
//         { x: 2, y: 0, color: riskColors.low },
//         { x: 2, y: 1, color: riskColors.medium },
//         { x: 2, y: 2, color: riskColors.medium },
//         { x: 2, y: 3, color: riskColors.high },
//         { x: 2, y: 4, color: riskColors.high },
//         { x: 3, y: 0, color: riskColors.medium },
//         { x: 3, y: 1, color: riskColors.medium },
//         { x: 3, y: 2, color: riskColors.high },
//         { x: 3, y: 3, color: riskColors.high },
//         { x: 3, y: 4, color: riskColors.extreme },
//         { x: 4, y: 0, color: riskColors.medium },
//         { x: 4, y: 1, color: riskColors.high },
//         { x: 4, y: 2, color: riskColors.high },
//         { x: 4, y: 3, color: riskColors.extreme },
//         { x: 4, y: 4, color: riskColors.extreme },
//       ];

//       ctx.save();
//       cellColors.forEach(({ x, y, color }) => {
//         const left = scales.x.getPixelForValue(x);
//         const right = scales.x.getPixelForValue(x + 1);
//         const top = scales.y.getPixelForValue(y);
//         const bottom = scales.y.getPixelForValue(y + 1);

//         ctx.fillStyle = color;
//         ctx.fillRect(left, top, right - left, bottom - top);
//       });
//       ctx.restore();
//     },
//   };


//   return (
//     <Bubble
//       data={data}
//       options={options}
//       plugins={[backgroundPlugin]}
//     />
//   );
// };

// export default RiskMatrixBubbleChart;

import React from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip,
} from "chart.js";

const riskColors = {
  low: "rgba(0, 255, 0, 0.3)",
  medium: "rgba(255, 255, 0, 0.3)",
  high: "rgba(255, 165, 0, 0.3)",
  extreme: "rgba(255, 0, 0, 0.3)",
};

const MATRIX_SIZE = 5;

ChartJS.register(CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip);

const RiskMatrixBubbleChart = ({ datasets }: any) => {
  // Adjust points by adding 0.5 to both x and y
  const adjustedDatasets = datasets.map((dataset: any) => ({
    ...dataset,
    data: dataset.data.map((point: any) => ({
      ...point,
      x: point.x + 0.5, // Add 0.5 to x-axis
      y: point.y + 0.5, // Add 0.5 to y-axis
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
          text: "Impact of the Risk",
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
        },
        position: "bottom",
      },
      y: {
        title: {
          display: true,
          text: "Probability of the Risk",
        },
        min: 0,
        max: 5,
        reverse: false,
        ticks: {
          stepSize: 1,
          callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
    },
  };

  const backgroundPlugin = {
    id: "backgroundPlugin",
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