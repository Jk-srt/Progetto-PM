import React, { useState } from 'react';
import './index.css';
// Importazioni per i grafici
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

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
const ExpensePieChart = () => {
  const data = {
    labels: ['Alimentari', 'Trasporti', 'Utenze', 'Intrattenimento', 'Salute', 'Altro'],
    datasets: [
      {
        label: 'Spese mensili',
        data: [450, 350, 300, 250, 200, 900],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
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
    <div style={{ height: '250px' }}>
      <Doughnut data={data} options={options} />
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
        text: 'Andamento Investimenti 2024',
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
              label += new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
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
            return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(value);
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
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

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

// Componente Dashboard migliorato con grafici
const Dashboard = () => (
  <div className="dashboard">
    <div className="card">
      <h3>Panoramica</h3>
      <div className="mt-1">
        <p><strong>Saldo attuale:</strong> €4,250.00</p>
        <p><strong>Entrate mensili:</strong> <span className="text-success">€3,200.00</span></p>
        <p><strong>Uscite mensili:</strong> <span className="text-danger">€2,450.00</span></p>
      </div>
      <div className="mt-1">
        <ExpensePieChart />
      </div>
    </div>
    <div className="card">
      <h3>Investimenti</h3>
      <div className="mt-1">
        <p><strong>Valore totale:</strong> €12,450.00</p>
        <p><strong>Rendimento:</strong> <span className="text-success">+4.2%</span></p>
      </div>
      <div className="mt-1">
        <PortfolioAllocationChart />
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

// Componente per visualizzazione dettagliata degli investimenti (simile a Morningstar)
const InvestmentsDetail = () => (
  <div>
    <div className="card">
      <h3>Andamento Portafoglio</h3>
      <div className="mt-1">
        <InvestmentPerformanceChart />
      </div>
    </div>
    <div className="card mt-1">
      <h3>Confronto Rendimenti</h3>
      <div className="mt-1">
        <ReturnComparisonChart />
      </div>
    </div>
    <div className="card mt-1">
      <h3>Dettaglio Investimenti</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Quantità</th>
            <th>Prezzo</th>
            <th>Valore</th>
            <th>Rend. YTD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VWCE</td>
            <td>ETF</td>
            <td>15</td>
            <td>€102.45</td>
            <td>€1,536.75</td>
            <td className="text-success">+5.8%</td>
          </tr>
          <tr>
            <td>SWDA</td>
            <td>ETF</td>
            <td>25</td>
            <td>€84.20</td>
            <td>€2,105.00</td>
            <td className="text-success">+4.2%</td>
          </tr>
          <tr>
            <td>AGGH</td>
            <td>ETF</td>
            <td>40</td>
            <td>€52.75</td>
            <td>€2,110.00</td>
            <td className="text-danger">-0.8%</td>
          </tr>
          <tr>
            <td>Intesa Sanpaolo</td>
            <td>Azione</td>
            <td>200</td>
            <td>€3.45</td>
            <td>€690.00</td>
            <td className="text-success">+12.4%</td>
          </tr>
          <tr>
            <td>Enel</td>
            <td>Azione</td>
            <td>150</td>
            <td>€6.78</td>
            <td>€1,017.00</td>
            <td className="text-success">+3.2%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const TransactionsList = () => (
  <div className="card mt-1">
    <h3>Transazioni Recenti</h3>
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
        <tr>
          <td>15/03/2025</td>
          <td>Supermercato Esselunga</td>
          <td>Alimentari</td>
          <td className="text-danger">-€78.35</td>
        </tr>
        <tr>
          <td>14/03/2025</td>
          <td>Stipendio</td>
          <td>Entrate</td>
          <td className="text-success">+€1,800.00</td>
        </tr>
        <tr>
          <td>12/03/2025</td>
          <td>Ristorante Da Mario</td>
          <td>Ristoranti</td>
          <td className="text-danger">-€45.00</td>
        </tr>
        <tr>
          <td>10/03/2025</td>
          <td>Amazon</td>
          <td>Shopping</td>
          <td className="text-danger">-€29.99</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const FinancialNews = () => (
  <div className="card mt-1">
    <h3>Notizie Finanziarie</h3>
    <ul style={{ listStyleType: 'none' }}>
      <li className="mb-1">
        <strong>BCE mantiene i tassi d'interesse invariati</strong>
        <p>La Banca Centrale Europea ha deciso di mantenere i tassi d'interesse attuali...</p>
      </li>
      <li className="mb-1">
        <strong>Mercati azionari in rialzo</strong>
        <p>I principali indici europei hanno chiuso la giornata in positivo...</p>
      </li>
    </ul>
  </div>
);

const LLMAssistant = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulazione di risposta LLM
    setResponse(`Ecco alcune informazioni sul tuo quesito "${query}". Gli investimenti in ETF rappresentano una strategia diversificata con commissioni contenute. Per la tua situazione finanziaria, potrebbe essere utile considerare...`);
  };

  return (
    <div className="card mt-1">
      <h3>Assistente Finanziario</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chiedi consigli finanziari..."
        />
        <button type="submit">Chiedi</button>
      </form>
      {response && (
        <div className="mt-1">
          <p><strong>Risposta:</strong></p>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Dashboard />
            <TransactionsList />
          </>
        );
      case 'transactions':
        return (
          <div className="card">
            <h3>Gestione Transazioni</h3>
            <p>Interfaccia completa per la gestione delle transazioni</p>
            {/* Qui andrebbe il componente completo per gestire le transazioni */}
          </div>
        );
      case 'investments':
        return <InvestmentsDetail />;
      case 'news':
        return <FinancialNews />;
      case 'assistant':
        return <LLMAssistant />;
      default:
        return <Dashboard />;
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
                  onClick={(e) => {e.preventDefault(); setActiveTab('dashboard')}}
                  className={activeTab === 'dashboard' ? 'active' : ''}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="#transactions" 
                  onClick={(e) => {e.preventDefault(); setActiveTab('transactions')}}
                  className={activeTab === 'transactions' ? 'active' : ''}
                >
                  Transazioni
                </a>
              </li>
              <li>
                <a 
                  href="#investments" 
                  onClick={(e) => {e.preventDefault(); setActiveTab('investments')}}
                  className={activeTab === 'investments' ? 'active' : ''}
                >
                  Investimenti
                </a>
              </li>
              <li>
                <a 
                  href="#news" 
                  onClick={(e) => {e.preventDefault(); setActiveTab('news')}}
                  className={activeTab === 'news' ? 'active' : ''}
                >
                  Notizie
                </a>
              </li>
              <li>
                <a 
                  href="#assistant" 
                  onClick={(e) => {e.preventDefault(); setActiveTab('assistant')}}
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
