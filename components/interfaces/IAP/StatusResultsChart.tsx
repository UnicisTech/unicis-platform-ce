import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const labels = [
    'Passed',
    'Failed',
];

const StatusResultsChart = ({
    passed,
    failed,
}: {
    passed: number;
    failed: number;
}) => {
    console.log('StatusResultsChart', {passed, failed})
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Answers',
                data: [passed, failed],
                backgroundColor: [
                    'rgba(0, 135, 90, 0.7)',
                    'rgba(222, 53, 11, 0.7)',
                ],
                borderColor: [
                    'rgba(0, 135, 90, 0.7)',
                    'rgba(222, 53, 11, 0.7)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options: any = {
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Controls',
            },
        },
        maintainAspectRatio: false,
        responsive: true,
    };

    return <Doughnut data={data} options={options} />;
};

export default StatusResultsChart;
