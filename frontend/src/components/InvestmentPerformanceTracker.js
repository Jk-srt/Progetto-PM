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

const timeRanges = {
  '1M': { label: '1 Mese', days: 30 },
  '3M': { label: '3 Mesi', days: 90 },
  '1Y': { label: '1 Anno', days: 365 },
  '5Y': { label: '5 Anni', days: 1825 },
  'MAX': { label: 'Massimo', days: 365 * 10 } // 10 anni
};

const InvestmentPerformanceTracker = ({ investmentId, investmentName }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedRange, setSelectedRange] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalData(investmentId, range);
      setChartData({
        labels: data.labels,
        datasets: [{
          label: investmentName || investmentId,
          data: data.values,
          borderColor: '#1e3a8a',
          backgroundColor: 'rgba(30, 58, 138, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      });
    } catch (err) {
      console.error('Errore nel recupero dei dati:', err);
      setError('Impossibile caricare i dati storici. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(selectedRange);
    return () => controller.abort();
  }, [investmentId, selectedRange]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Andamento Storico: ${investmentName || investmentId}`,
        font: { size: 16 }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: €${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: selectedRange === '1M' ? 'day' : 
                selectedRange === '3M' ? 'week' : 
                selectedRange === '1Y' ? 'month' : 'year',
          tooltipFormat: 'dd/MM/yyyy'
        },
        adapters: { date: { locale: it } },
        title: { display: true, text: 'Data' }
      },
      y: {
        title: { display: true, text: 'Valore (€)' },
        ticks: { callback: (value) => `€${value.toFixed(2)}` }
      }
    }
  }), [selectedRange, investmentName, investmentId]);

  return (
    <div className="performance-tracker">
      <div className="tracker-header">
        <h3>{investmentName || investmentId}</h3>
        <div className="time-range-selector">
          {Object.entries(timeRanges).map(([key, { label }]) => (
            <button
              key={key}
              className={`range-button ${selectedRange === key ? 'active' : ''}`}
              onClick={() => setSelectedRange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Caricamento dati...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && chartData && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default React.memo(InvestmentPerformanceTracker);
