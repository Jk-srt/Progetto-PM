import React, { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const updateChart = async () => {
      try {
        const price = await fetchRealTimePrice(symbol);
        const now = new Date();
        
        setChartData(prevData => {
          const newLabels = [...prevData.labels, now];
          const newData = [...prevData.datasets[0].data, price];
          
          // Mantieni solo gli ultimi 60 punti dati (15 minuti con aggiornamenti ogni 15 secondi)
          if (newLabels.length > 60) {
            newLabels.shift();
            newData.shift();
          }
          
          return {
            labels: newLabels,
            datasets: [{
              ...prevData.datasets[0],
              data: newData
            }]
          };
        });
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Errore nell\'aggiornamento del prezzo:', err);
        setError('Impossibile aggiornare il prezzo. Riprova più tardi.');
        setLoading(false);
      }
    };

    // Aggiorna immediatamente e poi ogni 15 secondi
    updateChart();
    intervalRef.current = setInterval(updateChart, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          stepSize: 1,
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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      duration: 0 // Disabilita le animazioni per prestazioni migliori
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{ margin: 0 }}>{investmentName || symbol} - Tempo Reale</h3>
      </div>
      
      <div className="card-body" style={{ 
        height: '500px', 
        padding: '1rem',
        position: 'relative'
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="mt-2 text-muted">Caricamento dati in tempo reale...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert" style={{ margin: '1rem' }}>
            {error}
          </div>
        )}

        {!loading && !error && chartData.labels.length > 0 && (
          <Line 
            data={chartData} 
            options={chartOptions}
            height={450}
          />
        )}
      </div>
    </div>
  );
};

export default RealTimeStockChart;
