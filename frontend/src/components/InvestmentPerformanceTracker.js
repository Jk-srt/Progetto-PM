import React, { useState, useEffect, useMemo } from 'react';
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
import { fetchHistoricalData } from '../services/FinnhubService';

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

const TIMEFRAMES = {
  '1M': { label: '1 Mese', days: 30 },
  '3M': { label: '3 Mesi', days: 90 },
  '1Y': { label: '1 Anno', days: 365 },
  '5Y': { label: '5 Anni', days: 1825 },
  'MAX': { label: 'Massimo', days: 3650 }
};

const InvestmentPerformanceTracker = ({ investmentId, investmentName }) => {
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // Funzione per caricare i dati storici
  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Caricamento dati per ${investmentId}, timeframe: ${timeframe}`);
        const data = await fetchHistoricalData(investmentId, timeframe);
        
        // Verifica se i dati sono simulati
        setIsSimulated(data.datasets?.[0]?.label?.includes('simulato') || false);
        
        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError(`Impossibile caricare i dati: ${err.message}`);
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [investmentId, timeframe]);

  // Opzioni del grafico memorizzate
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('it-IT', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
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
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe === '1M' ? 'day' : 
                timeframe === '3M' ? 'week' : 
                timeframe === '1Y' ? 'month' : 'quarter',
          displayFormats: {
            day: 'dd MMM',
            week: 'dd MMM',
            month: 'MMM yyyy',
            quarter: 'MMM yyyy'
          }
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
            return new Intl.NumberFormat('it-IT', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value);
          }
        }
      }
    }
  }), [timeframe, investmentName, investmentId]);

  // Stile dei pulsanti
  const buttonStyle = (isActive) => ({
    padding: '8px 12px',
    margin: '0 4px',
    backgroundColor: isActive ? '#1e3a8a' : '#f8fafc',
    color: isActive ? 'white' : '#1e3a8a',
    border: '1px solid #1e3a8a',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="card">
      <div className="card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {investmentName || investmentId}
          </h3>
          {isSimulated && (
            <div style={{ 
              fontSize: '12px', 
              color: '#f59e0b', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>Dati simulati (API non disponibile)</span>
            </div>
          )}
        </div>
        <div>
          {Object.entries(TIMEFRAMES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              style={buttonStyle(timeframe === key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="card-body" style={{ height: '500px', padding: '16px', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #1e3a8a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Caricamento dati in corso...</span>
          </div>
        )}
        
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
            margin: '16px 0'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Errore:</p>
            <p style={{ margin: '8px 0 0 0' }}>{error}</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Sto visualizzando dati simulati come alternativa.
            </p>
          </div>
        )}
        
        {!loading && chartData && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default InvestmentPerformanceTracker;
