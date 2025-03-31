import React, {useState, useEffect} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import NewsPage from './pages/NewsPage';
import AssistantPage from './pages/AssistantPage';
import ExpensePieChart from './components/ExpensePieChart';
import './components/chartConfig';
import './index.css';
import {Pie, Line, Bar, Doughnut} from 'react-chartjs-2';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import PortfolioAllocationChart from "./components/PortfolioAllocationChart";
import InvestmentPerformanceChart from "./components/InvestmentPerformanceChart";
import returnComparisonChart from "./components/ReturnComparisonChart";
import Dashboard from "./components/Dashboard";
import InvestmentsDetail from "./components/InvestmentDetail";
import TransactionsList from "./components/TransactionsList";

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
