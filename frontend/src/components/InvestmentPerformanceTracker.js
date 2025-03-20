import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { it } from 'date-fns/locale';
import { getInvestmentData } from '../utils/mockInvestmentData';

// Registrazione dei componenti necessari di ChartJS
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
);

const InvestmentPerformanceTracker = ({ investmentId, investmentName }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1Y'); // Default: 1 anno

  useEffect(() => {
    // Funzione per recuperare i dati da Yahoo Finance
    const fetchInvestmentData = async () => {
      setLoading(true);
      try {
        // Utilizza la funzione dal servizio per ottenere dati YF o simulati
        const data = await getInvestmentData(investmentId, timeRange);
        setPerformanceData(data);
        setError(null);
      } catch (err) {
        console.error("Errore nel recupero dei dati di performance:", err);
        setError("Impossibile caricare i dati. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, [investmentId, timeRange]);

  // Configurazione del grafico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Andamento storico: ${investmentName || investmentId}`,
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
      x: {
        type: 'time',
        time: {
          unit: timeRange === '1M' ? 'day' : 
                timeRange === '3M' ? 'week' : 
                timeRange === '1Y' ? 'month' : 'quarter'
        },
        title: {
          display: true,
          text: 'Data'
        },
        adapters: {
          date: {
            locale: it,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valore (€)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(value);
          }
        }
      }
    }
  };

  // Stili per i bottoni del selettore di intervallo temporale
  const buttonStyle = (isActive) => ({
    margin: '0 5px',
    padding: '5px 10px',
    backgroundColor: isActive ? '#1e3a8a' : 'white',
    color: isActive ? 'white' : '#1e3a8a',
    border: `1px solid #1e3a8a`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  });

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{investmentName || "Andamento dell'Investimento"}</h3>
        <div className="time-range-selector">
          <button 
            style={buttonStyle(timeRange === '1M')}
            onClick={() => setTimeRange('1M')}
          >
            1M
          </button>
          <button 
            style={buttonStyle(timeRange === '3M')}
            onClick={() => setTimeRange('3M')}
          >
            3M
          </button>
          <button 
            style={buttonStyle(timeRange === '1Y')}
            onClick={() => setTimeRange('1Y')}
          >
            1A
          </button>
          <button 
            style={buttonStyle(timeRange === '5Y')}
            onClick={() => setTimeRange('5Y')}
          >
            5A
          </button>
          <button 
            style={buttonStyle(timeRange === 'MAX')}
            onClick={() => setTimeRange('MAX')}
          >
            MAX
          </button>
        </div>
      </div>
      <div className="card-body" style={{ height: '400px', padding: '20px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Caricamento dati in corso...</p>
          </div>
        )}
        
        {error && (
          <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {performanceData && !loading && !error && (
          <Line 
            data={performanceData} 
            options={chartOptions} 
            height={350}
          />
        )}
      </div>
    </div>
  );
};

export default InvestmentPerformanceTracker;
