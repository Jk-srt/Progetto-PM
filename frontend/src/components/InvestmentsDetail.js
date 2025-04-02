import {Bar, Line} from "react-chartjs-2";
import React from "react";

// Componente per visualizzazione dettagliata degli investimenti (simile a Morningstar)
const InvestmentsDetail = () => {
    // Dati per il grafico di andamento del portafoglio
    const portfolioPerformanceData = {
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

    // Opzioni per il grafico di andamento del portafoglio
    const portfolioOptions = {
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
                    label: function(context) {
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
                    callback: function(value) {
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

    // Dati per il grafico di confronto rendimenti
    const returnComparisonData = {
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

    // Opzioni per il grafico di confronto rendimenti
    const returnOptions = {
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
                    label: function(context) {
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
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    // Dati degli investimenti aggiornati con simboli USA
    const investments = [
        { name: 'AAPL (Apple)', type: 'Azione', quantity: 15, price: 187.68, value: 2815.20, ytdReturn: 5.8 },
        { name: 'MSFT (Microsoft)', type: 'Azione', quantity: 10, price: 422.86, value: 4228.60, ytdReturn: 8.2 },
        { name: 'SPY (S&P 500 ETF)', type: 'ETF', quantity: 25, price: 513.75, value: 12843.75, ytdReturn: 4.2 },
        { name: 'VOO (Vanguard S&P 500)', type: 'ETF', quantity: 15, price: 478.25, value: 7173.75, ytdReturn: 4.0 },
        { name: 'JPM (JPMorgan Chase)', type: 'Azione', quantity: 20, price: 248.12, value: 4962.40, ytdReturn: -1.16 },
        { name: 'AGG (iShares Bond ETF)', type: 'ETF', quantity: 30, price: 98.30, value: 2949.00, ytdReturn: -0.8 }
    ];

    return (
        <div>
            <div className="card">
                <h3>Andamento Portafoglio</h3>
                <div className="mt-1">
                    <div style={{ height: '300px' }}>
                        <Line data={portfolioPerformanceData} options={portfolioOptions} />
                    </div>
                </div>
            </div>

            <div className="card mt-1">
                <h3>Confronto Rendimenti</h3>
                <div className="mt-1">
                    <div style={{ height: '300px' }}>
                        <Bar data={returnComparisonData} options={returnOptions} />
                    </div>
                </div>
            </div>

            <div className="card mt-1">
                <h3>Dettaglio Investimenti (Mercato USA)</h3>
                <div className="mt-1" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Nome</th>
                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Tipo</th>
                            <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Quantità</th>
                            <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Prezzo</th>
                            <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Valore</th>
                            <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>Rend. YTD</th>
                        </tr>
                        </thead>
                        <tbody>
                        {investments.map((investment, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{investment.name}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{investment.type}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{investment.quantity}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                                    ${investment.price.toFixed(2)}
                                </td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                                    ${investment.value.toFixed(2)}
                                </td>
                                <td style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    textAlign: 'right',
                                    color: investment.ytdReturn >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {investment.ytdReturn >= 0 ? '+' : ''}{investment.ytdReturn}%
                                </td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold' }}>
                            <td style={{ padding: '10px' }} colSpan={4}>Totale</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                ${investments.reduce((sum, inv) => sum + inv.value, 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                {investments.reduce((sum, inv) => sum + (inv.value * inv.ytdReturn), 0) /
                                investments.reduce((sum, inv) => sum + inv.value, 0) > 0 ? '+' : ''}
                                {(investments.reduce((sum, inv) => sum + (inv.value * inv.ytdReturn), 0) /
                                    investments.reduce((sum, inv) => sum + inv.value, 0)).toFixed(2)}%
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-1">
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        <em>Nota: I dati si riferiscono esclusivamente al mercato USA in conformità con le limitazioni dell'API Finnhub.</em>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvestmentsDetail;