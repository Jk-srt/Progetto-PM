import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchRealTimeData } from '../services/YahooFinanceService';
import { YahooFinanceSocket } from '../services/YahooFinanceWebSocket';

// Registrazione dei componenti necessari di ChartJS
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

const RealTimeStockChart = ({ symbol, investmentName }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMode, setUpdateMode] = useState('polling'); // 'polling' o 'websocket'
  
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  
  // Funzione per aggiungere un nuovo punto dati al grafico
  const updateChartData = (newData) => {
    if (!newData || !newData.price) return;
    
    setChartData(prevData => {
      if (!prevData || !prevData.labels || !prevData.datasets) return prevData;
      
      // Crea copie profonde per evitare modifiche dirette allo stato
      const newLabels = [...prevData.labels, new Date()];
      const newDatasets = prevData.datasets.map(dataset => ({
        ...dataset,
        data: [...dataset.data, newData.price]
      }));
      
      // Limita a 100 punti per mantenere le prestazioni
      if (newLabels.length > 100) {
        newLabels.shift();
        newDatasets.forEach(dataset => dataset.data.shift());
      }
      
      return {
        labels: newLabels,
        datasets: newDatasets
      };
    });
  };
  
  // Gestione WebSocket
  const setupWebSocket = () => {
    socketRef.current = new YahooFinanceSocket([symbol], (data) => {
      if (data.symbol === symbol) {
        updateChartData(data);
      }
    });
    socketRef.current.connect();
  };
  
  // Gestione Polling
  const setupPolling = () => {
    // Intervallo iniziale a 10 secondi
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = await fetchRealTimeData(symbol, '1m');
        if (data && data.datasets && data.datasets[0].data.length > 0) {
          const latestPrice = data.datasets[0].data[data.datasets[0].data.length - 1];
          updateChartData({ price: latestPrice });
        }
      } catch (err) {
        console.error('Errore nel polling:', err);
      }
    }, 10000);
  };
  
  // Caricamento iniziale e impostazione degli aggiornamenti
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchRealTimeData(symbol, '1m');
        setChartData(data);
        
        // Avvia gli aggiornamenti in tempo reale
        if (updateMode === 'websocket') {
          setupWebSocket();
        } else {
          setupPolling();
        }
      } catch (err) {
        console.error('Errore nel caricamento dei dati iniziali:', err);
        setError('Impossibile caricare i dati in tempo reale. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Pulizia al dismount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [symbol, updateMode]);
  
  // Cambia modalità di aggiornamento
  useEffect(() => {
    // Pulisci connessioni esistenti
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Imposta nuova modalità se abbiamo già dati caricati
    if (chartData) {
      if (updateMode === 'websocket') {
        setupWebSocket();
      } else {
        setupPolling();
      }
    }
  }, [updateMode]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
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
      },
      y: {
        title: {
          display: true,
          text: 'Prezzo'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('it-IT', { 
              style: 'currency', 
              currency: 'EUR',
              maximumFractionDigits: 2
            }).format(value);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Andamento in tempo reale: ${investmentName || symbol}`,
        font: {
          size: 16
        }
      },
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
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: false // Disabilita animazioni per performance con aggiornamenti frequenti
  };
  
  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{investmentName || symbol} - Tempo Reale</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setUpdateMode('polling')}
            style={{
              padding: '5px 10px',
              backgroundColor: updateMode === 'polling' ? '#1e3a8a' : 'white',
              color: updateMode === 'polling' ? 'white' : '#1e3a8a',
              border: '1px solid #1e3a8a',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Polling (10s)
          </button>
          <button
            onClick={() => setUpdateMode('websocket')}
            style={{
              padding: '5px 10px',
              backgroundColor: updateMode === 'websocket' ? '#1e3a8a' : 'white',
              color: updateMode === 'websocket' ? 'white' : '#1e3a8a',
              border: '1px solid #1e3a8a',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            WebSocket (5s)
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
        
        {chartData && !loading && !error && (
          <Line data={chartData} options={chartOptions} height={350} />
        )}
      </div>
    </div>
  );
};

export default RealTimeStockChart;
