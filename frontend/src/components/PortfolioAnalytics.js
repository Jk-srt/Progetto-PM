import React, { useState } from 'react';
import InvestmentPerformanceTracker from './InvestmentPerformanceTracker';
import RealTimeStockChart from './RealTimeStockChart';

const PortfolioAnalytics = () => {
  const [selectedInvestment, setSelectedInvestment] = useState('VWCE');
  const [viewMode, setViewMode] = useState('historical'); // 'historical' o 'realtime'
  
  // Lista di investimenti nel portafoglio
  const portfolioInvestments = [
    { id: 'VWCE', name: 'Vanguard FTSE All-World UCITS ETF USD Acc' },
    { id: 'SWDA', name: 'iShares Core MSCI World UCITS ETF' },
    { id: 'AGGH', name: 'iShares Core Global Aggregate Bond UCITS ETF' },
    { id: 'ISP', name: 'Intesa Sanpaolo' },
    { id: 'ENEL', name: 'Enel SpA' }
  ];

  // Ottiene i dettagli dell'investimento selezionato
  const getInvestmentDetails = (id) => {
    switch(id) {
      case 'VWCE':
        return [
          { label: 'ISIN', value: 'IE00BK5BQT80' },
          { label: 'Categoria Morningstar', value: 'Azionari Internazionali Large Cap Blend' },
          { label: 'Spese correnti', value: '0,22%' },
          { label: 'Rendimento YTD', value: '+5,8%', isPositive: true },
          { label: 'Rating Morningstar', value: '★★★★☆' },
          { label: 'TER', value: '0,22%' },
          { label: 'Valuta', value: 'USD' },
          { label: 'Patrimonio gestito', value: '6,23 miliardi USD' }
        ];
      case 'SWDA':
        return [
          { label: 'ISIN', value: 'IE00B4L5Y983' },
          { label: 'Categoria Morningstar', value: 'Azionari Internazionali Large Cap Blend' },
          { label: 'Spese correnti', value: '0,20%' },
          { label: 'Rendimento YTD', value: '+4,2%', isPositive: true },
          { label: 'Rating Morningstar', value: '★★★★★' },
          { label: 'TER', value: '0,20%' },
          { label: 'Valuta', value: 'USD' },
          { label: 'Patrimonio gestito', value: '52,1 miliardi USD' }
        ];
      case 'AGGH':
        return [
          { label: 'ISIN', value: 'IE00BDBRDM35' },
          { label: 'Categoria Morningstar', value: 'Obbligazionari Globali Large Cap' },
          { label: 'Spese correnti', value: '0,10%' },
          { label: 'Rendimento YTD', value: '-0,8%', isPositive: false },
          { label: 'Rating Morningstar', value: '★★★☆☆' },
          { label: 'TER', value: '0,10%' },
          { label: 'Valuta', value: 'USD' },
          { label: 'Patrimonio gestito', value: '4,15 miliardi USD' }
        ];
      case 'ISP':
        return [
          { label: 'ISIN', value: 'IT0000072618' },
          { label: 'Indice', value: 'FTSE MIB' },
          { label: 'Settore', value: 'Bancario' },
          { label: 'Rendimento YTD', value: '+12,4%', isPositive: true },
          { label: 'P/E', value: '8,37' },
          { label: 'Dividend Yield', value: '7,21%' },
          { label: 'Capitalizzazione', value: '52,4 miliardi EUR' },
          { label: 'Prezzo/Valore Contabile', value: '0,76' }
        ];
      case 'ENEL':
        return [
          { label: 'ISIN', value: 'IT0003128367' },
          { label: 'Indice', value: 'FTSE MIB' },
          { label: 'Settore', value: 'Utilities' },
          { label: 'Rendimento YTD', value: '+3,2%', isPositive: true },
          { label: 'P/E', value: '11,24' },
          { label: 'Dividend Yield', value: '5,78%' },
          { label: 'Capitalizzazione', value: '68,2 miliardi EUR' },
          { label: 'Prezzo/Valore Contabile', value: '1,87' }
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h3>Analisi Portafoglio</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
            <div style={{ flexGrow: 1, minWidth: '250px' }}>
              <label htmlFor="investment-selector" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Seleziona Investimento:
              </label>
              <select 
                id="investment-selector" 
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '100%',
                  fontSize: '16px'
                }}
                value={selectedInvestment}
                onChange={(e) => setSelectedInvestment(e.target.value)}
              >
                {portfolioInvestments.map(investment => (
                  <option key={investment.id} value={investment.id}>
                    {investment.name} ({investment.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Modalità visualizzazione:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setViewMode('historical')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'historical' ? '#1e3a8a' : 'white',
                    color: viewMode === 'historical' ? 'white' : '#1e3a8a',
                    border: '1px solid #1e3a8a',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Storico
                </button>
                <button
                  onClick={() => setViewMode('realtime')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'realtime' ? '#1e3a8a' : 'white',
                    color: viewMode === 'realtime' ? 'white' : '#1e3a8a',
                    border: '1px solid #1e3a8a',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Tempo Reale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visualizza il grafico appropriato in base alla modalità selezionata */}
      {viewMode === 'historical' ? (
        <InvestmentPerformanceTracker 
          investmentId={selectedInvestment} 
          investmentName={portfolioInvestments.find(inv => inv.id === selectedInvestment)?.name}
        />
      ) : (
        <RealTimeStockChart 
          symbol={selectedInvestment} 
          investmentName={portfolioInvestments.find(inv => inv.id === selectedInvestment)?.name}
        />
      )}
      
      {/* Informazioni aggiuntive sull'investimento */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Dettagli Investimento</h3>
        </div>
        <div className="card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Caratteristica</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Valore</th>
              </tr>
            </thead>
            <tbody>
              {getInvestmentDetails(selectedInvestment).map((detail, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{detail.label}</td>
                  <td 
                    style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #ddd',
                      color: detail.isPositive === true ? '#0f766e' : 
                             detail.isPositive === false ? '#dc2626' : 'inherit'
                    }}
                  >
                    {detail.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;
