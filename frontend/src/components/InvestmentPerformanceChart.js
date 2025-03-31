import {Line} from "react-chartjs-2";
import React from "react";

const InvestmentPerformanceChart = () => {
    const data = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        datasets: [
            {
                label: 'Tuo Portafoglio',
                data: [10000, 10200, 10150, 10300, 10450, 10400, 10650, 10800, 10950, 10900, 11100, 11250],
                borderColor: '#1e3a8a',
                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                pointRadius: 2,
                tension: 0.1,
                fill: true,
            },
            {
                label: 'Benchmark (S&P 500)',
                data: [10000, 10150, 10250, 10200, 10350, 10300, 10500, 10600, 10700, 10650, 10800, 10900],
                borderColor: '#FF6384',
                borderDash: [5, 5],
                pointRadius: 0,
                tension: 0.1,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Andamento Investimenti 2025',
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
                            label += new Intl.NumberFormat('it-IT', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(context.parsed.y);
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
                        return new Intl.NumberFormat('it-IT', {
                            style: 'currency',
                            currency: 'USD',
                            maximumSignificantDigits: 3
                        }).format(value);
                    }
                }
            }
        }
    };

    return (
        <div style={{height: '300px'}}>
            <Line data={data} options={options}/>
        </div>
    );
};

export default InvestmentPerformanceChart;