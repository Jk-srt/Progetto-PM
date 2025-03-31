import React from 'react';
import { Pie } from 'react-chartjs-2';

// Componente grafico a torta per la distribuzione delle spese
const ExpensePieChart = ({ appo}) => {
    const data = {
        labels: Array.from(appo.keys()),
        datasets: [
            {
                label: 'Spese mensili',
                data: Array.from(appo.values()),
                backgroundColor: [
                    '#A8DADC',
                    '#457B9D',
                    '#F4A261',
                    '#2A9D8F',
                    '#E9C46A',
                    '#264653'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Distribuzione Spese Mensili',
                font: {
                    size: 16
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ height: '250px' }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default ExpensePieChart;
