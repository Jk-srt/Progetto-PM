import {Bar} from "react-chartjs-2";
import React from "react";

const ReturnComparisonChart = () => {
    const data = {
        labels: ['1 Mese', '3 Mesi', '6 Mesi', '1 Anno', '3 Anni', '5 Anni'],
        datasets: [
            {
                label: 'Tuo Portafoglio',
                data: [1.2, 3.5, 5.8, 8.4, 24.2, 42.5],
                backgroundColor: '#1e3a8a',
            },
            {
                label: 'Categoria',
                data: [0.8, 2.9, 4.7, 7.2, 19.8, 36.3],
                backgroundColor: '#36A2EB',
            },
            {
                label: 'Indice',
                data: [1.0, 3.2, 5.1, 7.8, 22.1, 39.7],
                backgroundColor: '#FF6384',
            },
        ],
    };

    const options = {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Rendimenti a Confronto (%)',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + '%';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    return (
        <div style={{height: '300px'}}>
            <Bar data={data} options={options}/>
        </div>
    );
};

export default ReturnComparisonChart;