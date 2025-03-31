import ExpensePieChart from "./ExpensePieChart";
import PortfolioAllocationChart from "./PortfolioAllocationChart";
import React from "react";

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

export default Dashboard;