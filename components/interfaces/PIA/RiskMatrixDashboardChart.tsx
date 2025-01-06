import React, { useRef, useEffect, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip);

const MATRIX_SIZE = 5; // 5x5 matrix

const riskColors = {
  low: "rgba(0, 255, 0, 0.3)",
  medium: "rgba(255, 255, 0, 0.3)",
  high: "rgba(255, 165, 0, 0.3)",
  extreme: "rgba(255, 0, 0, 0.3)",
};

const RiskMatrixDashboardChart = ({ datasets, counterMap, cellSize = 40 }: any) => {
    const chartRef = useRef<any>(null);
    const [points, setPoints] = useState<any[]>([]);
    const chartWidth = cellSize * MATRIX_SIZE * 1.5;
    const chartHeight = cellSize * MATRIX_SIZE;

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: "Security of the Risk" },
                min: 0,
                max: MATRIX_SIZE,
                ticks: {
                    stepSize: 1,
                    callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
                },
            },
            y: {
                title: { display: true, text: "Probability of the Risk" },
                min: 0,
                max: MATRIX_SIZE,
                ticks: {
                    stepSize: 1,
                    callback: (value: number) => `${(value / MATRIX_SIZE) * 100}%`,
                },
                reverse: false,
            },
        },
        plugins: { legend: { display: false } },
    };

    const backgroundPlugin = {
        id: "backgroundPlugin",
        beforeDraw: (chart) => {
            const { ctx, scales } = chart;

            // Define the colors for each cell in the matrix
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
                  value: counterMap.get(`${x},${y}`) || 0
                }))
              ).flat();
            setPoints(newPoints);
        }
    }, [datasets]);

    return (
        <div
            style={{
                position: "relative",
                width: `${chartWidth}px`,
                height: `${chartHeight}px`,
                margin: "auto",
            }}
        >
            <Bubble ref={chartRef} data={{ datasets }} options={options} plugins={[backgroundPlugin]}/>

            {/* Overlayed Components */}
            {points.map((point, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        transform: "translate(-50%, -50%)",
                        width: `${cellSize * 0.8}px`, // Scale to fit inside cell
                        height: `${cellSize * 0.8}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        borderRadius: "8px",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                        fontSize: "14px",
                        textAlign: "center",
                    }}
                >
                    {point.value}
                </div>
            ))}
        </div>
    );
};

export default RiskMatrixDashboardChart;