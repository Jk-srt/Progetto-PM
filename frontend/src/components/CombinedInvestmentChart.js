import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import FinnhubService from '../services/FinnhubService';
import { it } from 'date-fns/locale';
import { fetchRealTimePrice } from '../services/FinnhubService';
import { fetchHistoricalData } from '../services/SerpapiSevice';

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

// Funzione per ottenere l'unità di tempo appropriata in base al timeframe
const getTimeUnit = (timeframe) => {
  switch(timeframe) {
    case '1D': return 'minute';
    case '1W': return 'hour';
    case '1M': return 'day';
    case '3M': return 'day';
    case '1Y': return 'month';
    case '5Y': return 'month';
    case 'MAX': return 'year';
    default: return 'day';
  }
};

// Creazione di uno stile CSS per l'animazione di spinning
const createSpinningAnimation = () => {
  if (!document.querySelector('#spin-animation')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'spin-animation';
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

const CombinedInvestmentChart = ({ symbol, investmentName }) => {
  // Stato per i dati del grafico
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: symbol,
      data: [],
      borderColor: '#1e3a8a',
      backgroundColor: 'rgba(30, 58, 138, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    }]
  });
  
  // Stato per il prezzo attuale
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [percentChange, setPercentChange] = useState(null);
  
  // Stato UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [pollingInterval, setPollingInterval] = useState(5000); // 5 secondi di default
  
  // Ref per il polling
  const intervalRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  
  // Funzione di utilità per ottenere tutti i valori Y dai dataset
  const getAllDataValues = (chartData) => {
    if (!chartData || !chartData.datasets) return [0, 100];
    
    let allValues = [];
    chartData.datasets.forEach(dataset => {
      if (dataset.data) {
        dataset.data.forEach(point => {
          if (point && typeof point.y === 'number') {
            allValues.push(point.y);
          }
        });
      }
    });
    
    return allValues.length > 0 ? allValues : [0, 100];
  };
  
  // Effetto per l'animazione
  useEffect(() => {
    createSpinningAnimation();
  }, []);
  
  // Carica dati iniziali
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Carica dati storici reali
        const historical = await fetchHistoricalData(symbol, timeframe);
        // 2. Carica prezzo attuale
        const priceData = await fetchRealTimePrice(symbol);
        setCurrentPrice(priceData.price);
        setPriceChange(priceData.change);
        setPercentChange(priceData.percentChange);

        // 3. Prepara datasets: storico + tempo reale (vuoto all'inizio)
        setChartData({
          labels: historical.labels,
          datasets: [
            {
              ...historical.datasets[0],
              label: `${symbol} (Storico)`,
            },
            {
              label: `${symbol} (Tempo Reale)`,
              data: [],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 3,
              tension: 0,
              fill: false
            }
          ]
        });

        setLoading(false);
        isInitialLoadRef.current = false;
      } catch (err) {
        setError('Impossibile caricare i dati. Riprova più tardi.');
        setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, timeframe]);
  
  // Configura il polling per gli aggiornamenti in tempo reale
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const updateRealTimeData = async () => {
      try {
        const priceData = await fetchRealTimePrice(symbol);
        setCurrentPrice(priceData.price);
        setPriceChange(priceData.change);
        setPercentChange(priceData.percentChange);

        setChartData(prevData => {
          const now = new Date();
          const newRealtimeData = [...prevData.datasets[1].data, { x: now, y: priceData.price }];
          const maxRealtimePoints = 30;
          const slicedRealtimeData = newRealtimeData.length > maxRealtimePoints
            ? newRealtimeData.slice(newRealtimeData.length - maxRealtimePoints)
            : newRealtimeData;

          return {
            ...prevData,
            datasets: [
              prevData.datasets[0], // storico
              {
                ...prevData.datasets[1],
                data: slicedRealtimeData
              }
            ]
          };
        });
      } catch (err) {
        // gestisci errori silenziosamente
      }
    };

    updateRealTimeData();
    intervalRef.current = setInterval(updateRealTimeData, pollingInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, pollingInterval, isInitialLoadRef.current]);
  
  // Opzioni del grafico ottimizzate
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500 // Animazione veloce per aggiornamenti fluidi
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      tooltip: {
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
                currency: 'USD',
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
        text: `Andamento di ${investmentName || symbol}`,
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: getTimeUnit(timeframe),
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'dd MMM',
            week: 'dd MMM',
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Data/Ora'
        },
        adapters: {
          date: {
            locale: it,
          },
        },
      },
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'Prezzo ($)'
        },
        // CORREZIONE: Imposta i limiti in base ai dati effettivi
        min: function(context) {
          const allValues = getAllDataValues(chartData);
          const min = Math.min(...allValues) * 0.99; // 1% di margine sotto
          return Math.max(0, min); // Non scende mai sotto zero
        },
        max: function(context) {
          const allValues = getAllDataValues(chartData);
          return Math.max(...allValues) * 1.01; // 1% di margine sopra
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('it-IT', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value);
          }
        }
      }
    }
  }), [timeframe, chartData, investmentName, symbol]);

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
            {investmentName || symbol}
            {currentPrice && (
              <span style={{ marginLeft: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('it-IT', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(currentPrice)}
                </span>
                {priceChange !== null && (
                  <span style={{ 
                    color: priceChange >= 0 ? '#10b981' : '#ef4444',
                    marginLeft: '8px',
                    fontSize: '0.9em'
                  }}>
                    {priceChange >= 0 ? '▲' : '▼'} 
                    {new Intl.NumberFormat('it-IT', { 
                      style: 'currency', 
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(Math.abs(priceChange))} 
                    ({percentChange >= 0 ? '+' : ''}
                    {percentChange?.toFixed(2)}%)
                  </span>
                )}
              </span>
            )}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '20px' }}>
            <button style={buttonStyle(timeframe === '1D')} onClick={() => setTimeframe('1D')}>1G</button>
            <button style={buttonStyle(timeframe === '1W')} onClick={() => setTimeframe('1W')}>1S</button>
            <button style={buttonStyle(timeframe === '1M')} onClick={() => setTimeframe('1M')}>1M</button>
            <button style={buttonStyle(timeframe === '3M')} onClick={() => setTimeframe('3M')}>3M</button>
            <button style={buttonStyle(timeframe === '1Y')} onClick={() => setTimeframe('1Y')}>1A</button>
            <button style={buttonStyle(timeframe === '5Y')} onClick={() => setTimeframe('5Y')}>5A</button>
          </div>
          <select 
            value={pollingInterval} 
            onChange={(e) => setPollingInterval(parseInt(e.target.value))}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value={5000}>Aggiorna: 5s</option>
            <option value={10000}>Aggiorna: 10s</option>
            <option value={15000}>Aggiorna: 15s</option>
            <option value={30000}>Aggiorna: 30s</option>
          </select>
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
          </div>
        )}
        
        {!loading && chartData.datasets[0].data.length > 0 && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default CombinedInvestmentChart;
