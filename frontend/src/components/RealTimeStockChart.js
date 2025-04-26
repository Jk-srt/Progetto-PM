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
import { it } from 'date-fns/locale';
import { fetchRealTimePrice } from '../services/FinnhubService';
import { fetchHistoricalData} from '../serices/YahooFinanceService';

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

const RealTimeStockChart = ({ symbol, investmentName }) => {
  // Stato per i dati e l'UI
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
  
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [percentChange, setPercentChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(15000); // 15 secondi di default
  const [timeframe, setTimeframe] = useState('1D'); // Nuovo stato per il timeframe
  
  // Ref per il polling
  const intervalRef = useRef(null);
  
  // Effetto per l'animazione
  useEffect(() => {
    createSpinningAnimation();
  }, []);
  
  // Effetto per caricare i dati storici iniziali
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setLoading(true);
        const historicalData = await fetchHistoricalData(symbol, timeframe);
        setChartData(historicalData);

        // Imposta il prezzo corrente basandosi sull'ultimo dato
        if (historicalData.datasets[0].data.length > 0) {
          const lastDataPoint = historicalData.datasets[0].data[historicalData.datasets[0].data.length - 1];
          setCurrentPrice(lastDataPoint.y);
        }

        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento dei dati storici:', err);
        setError('Impossibile caricare i dati storici.');
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [symbol, timeframe]);
  
  // Effetto per il polling dei dati
  useEffect(() => {
    // Funzione per aggiornare i dati in tempo reale
    const updateRealTimeData = async () => {
      try {
        const data = await fetchRealTimePrice(symbol);
        
        // Aggiorna i dati sul prezzo corrente
        setCurrentPrice(data.price);
        setPriceChange(data.change);
        setPercentChange(data.percentChange);
        setIsSimulated(data.isSimulated || false);
        
        const now = new Date();

        // Aggiorna il grafico
        setChartData(prevData => {
          const newLabels = [...prevData.labels, now];
          const newPrices = [...prevData.datasets[0].data, data.price];
          
          // Mantieni solo gli ultimi 30 punti per prestazioni ottimali
          const maxPoints = 30;
          const sliceStart = newLabels.length > maxPoints ? newLabels.length - maxPoints : 0;
          
          return {
            labels: newLabels.slice(sliceStart),
            datasets: [{
              ...prevData.datasets[0],
              data: newPrices.slice(sliceStart)
            }]
          };
        });
        
        // Imposta loading a false dopo il primo caricamento
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Errore nell\'aggiornamento dei dati:', err);
        
        // Non impostare un errore se ci sono già dati visualizzati
        if (loading) {
          setError('Impossibile caricare i dati in tempo reale. Utilizzando dati simulati.');
          setLoading(false);
        }
      }
    };
    
    if (!loading) {
      intervalRef.current = setInterval(updateRealTimeData, pollingInterval);
      updateRealTimeData();
    }

    // Cleanup all'unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, pollingInterval, loading]);
  
  // Opzioni del grafico memorizzate
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disabilita le animazioni per prestazioni con aggiornamenti frequenti
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
        display: false // Nascondi la legenda che è già visibile nell'header
      },
      title: {
        display: true,
        text: `Andamento in tempo reale: ${investmentName || symbol}`,
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm:ss'
          },
          tooltipFormat: 'HH:mm:ss'
        },
        title: {
          display: true,
          text: 'Orario'
        },
        adapters: {
          date: {
            locale: it,
          },
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        title: {
          display: true,
          text: 'Prezzo (€)'
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
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  }), [symbol, investmentName]);

  // Componente per il selettore di intervallo
  const TimeframeSelector = ({ currentTimeframe, onChange }) => {
    const timeframes = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'MAX'];

    return (
      <div style={{ marginBottom: '16px' }}>
        {timeframes.map(tf => (
          <button
            key={tf}
            onClick={() => onChange(tf)}
            style={{
              margin: '0 4px',
              padding: '8px 12px',
              backgroundColor: tf === currentTimeframe ? '#1e3a8a' : '#f3f4f6',
              color: tf === currentTimeframe ? '#fff' : '#000',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tf}
          </button>
        ))}
      </div>
    );
  };

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
            {currentPrice && !loading && (
              <span style={{ marginLeft: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('it-IT', { 
                    style: 'currency', 
                    currency: 'EUR',
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
                      currency: 'EUR',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(Math.abs(priceChange))} 
                    ({percentChange >= 0 ? '+' : ''}
                    {percentChange.toFixed(2)}%)
                  </span>
                )}
              </span>
            )}
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
            <option value={5000}>Aggiorna: 5 secondi</option>
            <option value={15000}>Aggiorna: 15 secondi</option>
            <option value={30000}>Aggiorna: 30 secondi</option>
            <option value={60000}>Aggiorna: 1 minuto</option>
          </select>
        </div>
      </div>
      
      <div className="card-body" style={{ height: '500px', padding: '16px', position: 'relative' }}>
        <TimeframeSelector currentTimeframe={timeframe} onChange={setTimeframe} />
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
        
        {!loading && chartData.labels.length > 0 && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default RealTimeStockChart;
