import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CompletionResultsChart = ({
    todo,
    inprogress,
    completed
}: {
    todo: number;
    inprogress: number;
    completed: number
}) => {
    const data = {
        labels: [
            'To do',
            'In progress',
            'Completed'
        ],
        datasets: [
            {
                label: 'Answers',
                data: [todo, inprogress, completed],
                backgroundColor: [
                    'rgba(223, 225, 230, 0.7)',
                    'rgba(0, 82, 204, 0.7)',
                    'rgba(0, 135, 90, 0.7)',
                ],
                borderColor: [
                    'rgba(223, 225, 230, 0.2)',
                    'rgba(0, 82, 204, 0.2)',
                    'rgba(0, 135, 90, 0.2)',
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

export default CompletionResultsChart;
