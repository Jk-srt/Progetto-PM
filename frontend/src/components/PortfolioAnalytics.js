import React, { useState } from 'react';
import CombinedInvestmentChart from './CombinedInvestmentChart';

const PortfolioAnalytics = () => {
  const [selectedInvestment, setSelectedInvestment] = useState('AAPL');
  
  // Lista di investimenti nel portafoglio (solo USA)
  const portfolioInvestments = [
    { id: 'AAPL', name: 'Apple Inc.', type: 'Azione' },
    { id: 'MSFT', name: 'Microsoft Corporation', type: 'Azione' },
    { id: 'GOOGL', name: 'Alphabet Inc. (Google)', type: 'Azione' },
    { id: 'AMZN', name: 'Amazon.com Inc.', type: 'Azione' },
    { id: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Azione' },
    { id: 'NEE', name: 'NextEra Energy Inc.', type: 'Azione' },
    { id: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF' },
    { id: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF' },
    { id: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', type: 'ETF' },
    { id: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF' },
    { id: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'ETF' }
  ];

  // Ottiene i dettagli dell'investimento selezionato
  const getInvestmentDetails = (id) => {
    const selectedInvestment = portfolioInvestments.find(inv => inv.id === id);
    
    // Dati di base comuni
    const baseDetails = [
      { label: 'Simbolo', value: id },
      { label: 'Tipo', value: selectedInvestment?.type || 'Sconosciuto' }
    ];
    
    // Dati specifici per tipo
    switch(id) {
      case 'AAPL':
        return [
          ...baseDetails,
          { label: 'Settore', value: 'Tecnologia' },
          { label: 'Capitalizzazione', value: '2.89 Trilioni USD' },
          { label: 'P/E Ratio', value: '33.20' },
          { label: 'Dividend Yield', value: '0.43%' },
          { label: 'Beta', value: '1.33' },
          { label: 'Mercato', value: 'NASDAQ' }
        ];
      case 'MSFT':
        return [
          ...baseDetails,
          { label: 'Settore', value: 'Tecnologia' },
          { label: 'Capitalizzazione', value: '3.04 Trilioni USD' },
          { label: 'P/E Ratio', value: '37.51' },
          { label: 'Dividend Yield', value: '0.72%' },
          { label: 'Beta', value: '0.89' },
          { label: 'Mercato', value: 'NASDAQ' }
        ];
      case 'JPM':
        return [
          ...baseDetails,
          { label: 'Settore', value: 'Finanza' },
          { label: 'Capitalizzazione', value: '720 Miliardi USD' },
          { label: 'P/E Ratio', value: '14.25' },
          { label: 'Dividend Yield', value: '2.18%' },
          { label: 'Beta', value: '1.07' },
          { label: 'Mercato', value: 'NYSE' }
        ];
      case 'SPY':
        return [
          ...baseDetails,
          { label: 'Categoria', value: 'Large Blend' },
          { label: 'Spese correnti', value: '0.09%' },
          { label: 'AUM', value: '473.66 Miliardi USD' },
          { label: 'N° di azioni', value: '503' },
          { label: 'Beta', value: '1.00' },
          { label: 'Emittente', value: 'State Street' }
        ];
      case 'VOO':
        return [
          ...baseDetails,
          { label: 'Categoria', value: 'Large Blend' },
          { label: 'Spese correnti', value: '0.03%' },
          { label: 'AUM', value: '331.42 Miliardi USD' },
          { label: 'N° di azioni', value: '508' },
          { label: 'Beta', value: '1.00' },
          { label: 'Emittente', value: 'Vanguard' }
        ];
      case 'QQQ':
        return [
          ...baseDetails,
          { label: 'Categoria', value: 'Large Growth' },
          { label: 'Spese correnti', value: '0.20%' },
          { label: 'AUM', value: '245.03 Miliardi USD' },
          { label: 'N° di azioni', value: '101' },
          { label: 'Beta', value: '1.15' },
          { label: 'Emittente', value: 'Invesco' }
        ];
      default:
        return baseDetails;
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h3>Analisi Portafoglio</h3>
        </div>
        <div className="card-body">
          <div>
            <label htmlFor="investment-selector" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Seleziona Investimento (solo mercato USA):
            </label>
            <select 
              id="investment-selector" 
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                marginTop: '8px',
                fontSize: '16px'
              }}
              value={selectedInvestment}
              onChange={(e) => setSelectedInvestment(e.target.value)}
            >
              <optgroup label="Azioni">
                {portfolioInvestments
                  .filter(inv => inv.type === 'Azione')
                  .map(investment => (
                    <option key={investment.id} value={investment.id}>
                      {investment.name} ({investment.id})
                    </option>
                  ))
                }
              </optgroup>
              <optgroup label="ETF">
                {portfolioInvestments
                  .filter(inv => inv.type === 'ETF')
                  .map(investment => (
                    <option key={investment.id} value={investment.id}>
                      {investment.name} ({investment.id})
                    </option>
                  ))
                }
              </optgroup>
            </select>
          </div>
        </div>
      </div>
      
      {/* Visualizza il grafico combinato per l'investimento selezionato */}
      <CombinedInvestmentChart 
        symbol={selectedInvestment} 
        investmentName={portfolioInvestments.find(inv => inv.id === selectedInvestment)?.name}
      />
      
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
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{detail.value}</td>
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
