import React, {useState, useEffect} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import NewsPage from './pages/NewsPage';
import AssistantPage from './pages/AssistantPage';

import {Tabs, TabsList, TabsTrigger, TabsContent} from "@radix-ui/react-tabs";
import './index.css';
// Importazioni per i grafici
import {Pie, Line, Bar, Doughnut} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    BarElement
} from 'chart.js';
// Importa i nuovi componenti
import PortfolioAnalytics from './components/PortfolioAnalytics';

// Registrazione dei componenti ChartJS necessari
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title
);

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

// Componente grafico a ciambella per l'allocazione del portafoglio
const PortfolioAllocationChart = () => {
    const data = {
        labels: ['Azioni', 'Obbligazioni', 'ETF', 'Fondi', 'Immobili', 'Liquidità'],
        datasets: [
            {
                label: 'Allocazione',
                data: [45, 20, 15, 10, 7, 3],
                backgroundColor: [
                    '#4BC0C0',
                    '#36A2EB',
                    '#FF6384',
                    '#FFCE56',
                    '#9966FF',
                    '#C9CBCF'
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
                text: 'Allocazione Portafoglio',
                font: {
                    size: 16
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{height: '250px'}}>
            <Doughnut data={data} options={options}/>
        </div>
    );
};

// Componente grafico lineare per l'andamento storico degli investimenti (stile Morningstar)
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

// Componente grafico a barre per confronto rendimenti (stile Morningstar)
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

// Componente Dashboard migliorato con grafici
const Dashboard = ({transactions, categories}) => {
    const saldo = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const monthEntrance = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const monthExit = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const data = new Map();
    for (let i = 0; i < categories.length; i++) {
        data.set(categories[i].name, transactions
            .filter(t => t.categoryId === categories[i].categoryId)
            .reduce((acc, t) => acc + t.amount, 0));
    }
    data.delete("Entrate");
    data.delete("Stipendio");
    
    // Ottiene le principali azioni e ETF USA dalla sezione investimenti
    const topInvestments = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 187.68, change: +1.25, changePercent: +0.67 },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 248.12, change: -2.91, changePercent: -1.16 },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 513.75, change: +0.82, changePercent: +0.16 }
    ];
    
    // Per navigare direttamente alla pagina di analisi dettagliata
    const navigateToAnalytics = (e) => {
        e.preventDefault();
        // Imposta entrambi gli stati per cambiare vista
        window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'investments' }));
        window.dispatchEvent(new CustomEvent('setActiveInvestmentTab', { detail: 'analytics' }));
    };
    
    return (
        <div className="dashboard">
            <div className="card">
                <h3>Panoramica</h3>
                <div className="mt-1">
                    <p>
                        <strong>Saldo attuale:</strong>
                        <span className={saldo < 0 ? "text-danger" : "text-success"}> €{saldo}</span>
                    </p>
                    <p>
                        <strong>Entrate mensili:</strong> <span className={monthEntrance < 0 ? "text-danger" : "text-success"}> €{monthEntrance}</span>
                    </p>
                    <p>
                        <strong>Uscite mensili:</strong> <span className={monthExit < 0 ? "text-danger" : "text-success"}> €{monthExit}</span>
                    </p>
                </div>
                <div className="mt-1">
                    <ExpensePieChart appo={data}/>
                </div>
            </div>
            <div className="card">
                <h3>Investimenti</h3>
                <div className="mt-1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p><strong>Valore totale:</strong> $34,972.70</p>
                            <p><strong>Rendimento YTD:</strong> <span className="text-success">+3.76%</span></p>
                        </div>
                        <a 
                            href="#" 
                            onClick={navigateToAnalytics}
                            style={{ 
                                color: '#1e3a8a', 
                                textDecoration: 'none',
                                padding: '6px 12px',
                                border: '1px solid #1e3a8a',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        >
                            Analisi Dettagliata →
                        </a>
                    </div>
                </div>
                
                {/* Aggiungi una tabella con i principali investimenti */}
                <div className="mt-2" style={{ marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Principali titoli (USA)</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                                <th style={{ textAlign: 'left', padding: '8px 0' }}>Simbolo</th>
                                <th style={{ textAlign: 'left', padding: '8px 0' }}>Nome</th>
                                <th style={{ textAlign: 'right', padding: '8px 0' }}>Prezzo</th>
                                <th style={{ textAlign: 'right', padding: '8px 0' }}>Var.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topInvestments.map(inv => (
                                <tr key={inv.symbol} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{inv.symbol}</td>
                                    <td style={{ padding: '8px 0' }}>{inv.name}</td>
                                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                                        ${inv.price.toFixed(2)}
                                    </td>
                                    <td style={{ 
                                        padding: '8px 0', 
                                        textAlign: 'right',
                                        color: inv.change >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        {inv.change >= 0 ? '+' : ''}{inv.change.toFixed(2)} ({inv.changePercent >= 0 ? '+' : ''}{inv.changePercent.toFixed(2)}%)
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-1">
                    <PortfolioAllocationChart/>
                </div>
            </div>
            <div className="card">
                <h3>Budget</h3>
                <div className="mt-1">
                    <p><strong>Spesa alimentare:</strong> 75% utilizzato</p>
                    <p><strong>Trasporti:</strong> 50% utilizzato</p>
                    <p><strong>Intrattenimento:</strong> 90% utilizzato</p>
                </div>
            </div>
        </div>
    );
};

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

const TransactionsList = ({transactions, categories = []}) => (
    <div className="card mt-1">
        <table>
            <thead>
            <tr>
                <th>Data</th>
                <th>Descrizione</th>
                <th>Categoria</th>
                <th>Importo</th>
            </tr>
            </thead>
            <tbody>
            {transactions.map(t => (
                <tr key={t.transactionid}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.description}</td>
                    <td>{categories.find(c => c.categoryId === t.categoryId)?.name || "N/A"}</td>
                    <td className={t.amount < 0 ? "text-danger" : "text-success"}>
                        {t.amount} {t.currency}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

// Soluzione 1: Funzione a corpo completo // Soluzione 2: Arrow function one-liner
const FinancialNews = () => <NewsPage/>;
const LLMAssistant = () => <AssistantPage/>;

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeInvestmentTab, setActiveInvestmentTab] = useState('overview'); // 'overview', 'analytics', 'transactions'
    const [data, setData] = useState({users: [], transactions: [], assets: [], investments: [], categories: []});

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:5000/api/users").then(res => res.json()),
            fetch("http://localhost:5000/api/transactions").then(res => res.json()),
            fetch("http://localhost:5000/api/assets").then(res => res.json()),
            fetch("http://localhost:5000/api/investments").then(res => res.json()),
            fetch("http://localhost:5000/api/categories").then(res => res.json()),
        ])
            .then(([users, transactions, assets, investments, categories]) => {
                setData({users, transactions, assets, investments, categories});
            })
            .catch(error => console.error("Errore nel recupero dei dati:", error));
    }, []);

    // Listener per gli eventi personalizzati
    useEffect(() => {
        const handleSetActiveTab = (e) => {
            setActiveTab(e.detail);
        };
        
        const handleSetActiveInvestmentTab = (e) => {
            setActiveInvestmentTab(e.detail);
        };
        
        window.addEventListener('setActiveTab', handleSetActiveTab);
        window.addEventListener('setActiveInvestmentTab', handleSetActiveInvestmentTab);
        
        return () => {
            window.removeEventListener('setActiveTab', handleSetActiveTab);
            window.removeEventListener('setActiveInvestmentTab', handleSetActiveInvestmentTab);
        };
    }, []);

    const renderInvestmentContent = () => {
        switch (activeInvestmentTab) {
          case 'overview':
            return <InvestmentsDetail />;
          case 'analytics':
            return <PortfolioAnalytics />;
          case 'transactions':
            return (
              <div className="card">
                <h3>Transazioni Investimenti</h3>
                <p>Storico delle operazioni di acquisto e vendita</p>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Investimento</th>
                      <th>Operazione</th>
                      <th>Quantità</th>
                      <th>Prezzo</th>
                      <th>Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>10/03/2025</td>
                      <td>VOO</td>
                      <td>Acquisto</td>
                      <td>5</td>
                      <td>$478.25</td>
                      <td>$2,391.25</td>
                    </tr>
                    <tr>
                      <td>01/03/2025</td>
                      <td>SPY</td>
                      <td>Acquisto</td>
                      <td>10</td>
                      <td>$513.75</td>
                      <td>$5,137.50</td>
                    </tr>
                    <tr>
                      <td>15/02/2025</td>
                      <td>AGG</td>
                      <td>Acquisto</td>
                      <td>15</td>
                      <td>$98.30</td>
                      <td>$1,474.50</td>
                    </tr>
                    <tr>
                      <td>05/02/2025</td>
                      <td>AAPL</td>
                      <td>Vendita</td>
                      <td>10</td>
                      <td>$188.35</td>
                      <td>$1,883.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          default:
            return <InvestmentsDetail />;
        }
      };
      

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <Dashboard transactions={data.transactions} categories={data.categories}/>
                        <TransactionsList transactions={data.transactions} categories={data.categories}/>
                    </>
                );
            case 'transactions':
                return (
                    <div className="card">
                        <h3>Gestione Transazioni</h3>
                        <p>Interfaccia completa per la gestione delle transazioni</p>
                        {data.transactions.map(transaction => (
                            <Card key={transaction.transactionid} className="mb-2">
                                <CardContent>
                                    <p><strong>Importo:</strong> {transaction.amount} {transaction.currency}</p>
                                    <p><strong>Data:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                                    <p><strong>Descrizione:</strong> {transaction.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                );
            case 'investments':
                return (
                    <>
                        <div className="investment-tabs">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${activeInvestmentTab === 'overview' ? 'active' : ''}`}
                                        href="#overview"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveInvestmentTab('overview')
                                        }}
                                    >
                                        Panoramica
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${activeInvestmentTab === 'analytics' ? 'active' : ''}`}
                                        href="#analytics"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveInvestmentTab('analytics')
                                        }}
                                    >
                                        Analisi Andamento
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${activeInvestmentTab === 'transactions' ? 'active' : ''}`}
                                        href="#transactions"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveInvestmentTab('transactions')
                                        }}
                                    >
                                        Transazioni
                                    </a>
                                </li>
                            </ul>
                        </div>
                        {renderInvestmentContent()}
                    </>
                );
            case 'news':
                return <FinancialNews/>;
            case 'assistant':
                return <LLMAssistant/>;
            default:
                return <Dashboard/>;
        }
    };

    return (
        <div className="App">
            <header>
                <div className="container">
                    <h1>FinanzaPro</h1>
                    <nav>
                        <ul>
                            <li>
                                <a
                                    href="#dashboard"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('dashboard')
                                    }}
                                    className={activeTab === 'dashboard' ? 'active' : ''}
                                >
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#transactions"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('transactions')
                                    }}
                                    className={activeTab === 'transactions' ? 'active' : ''}
                                >
                                    Transazioni
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#investments"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('investments')
                                    }}
                                    className={activeTab === 'investments' ? 'active' : ''}
                                >
                                    Investimenti
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#news"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('news')
                                    }}
                                    className={activeTab === 'news' ? 'active' : ''}
                                >
                                    Notizie
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#assistant"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('assistant')
                                    }}
                                    className={activeTab === 'assistant' ? 'active' : ''}
                                >
                                    Assistente
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main className="container">
                {renderContent()}
            </main>
            <footer>
                <div className="container">
                    <p>© 2025 FinanzaPro - Applicazione di Gestione Finanziaria Personale</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
