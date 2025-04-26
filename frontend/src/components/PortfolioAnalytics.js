import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { fetchListingStatus } from '../services/YahooFinanceService';
import CombinedInvestmentChart from './CombinedInvestmentChart';

const PortfolioAnalytics = () => {
  // 1) Stato diventa oggetto completo
  const [selectedOption, setSelectedOption] = useState({
    value: 'AAPL',
    name: 'Apple Inc.',
    type: 'Azione',
    exchange: 'NASDAQ'
  });

  // Lista base di investimenti nel portafoglio (solo USA)
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

  // 2) LoadOptions include ora name, type, exchange
  const loadOptions = async (inputValue) => {
    if (!inputValue) {
      return portfolioInvestments.map(inv => ({
        label: `${inv.name} (${inv.id})`,
        value: inv.id,
        name: inv.name,
        type: inv.type,
        exchange: 'USA Market'
      }));
    }
    const list = await fetchListingStatus(inputValue);
    return list.map(item => ({
      label: `${item.name} (${item.symbol})`,
      value: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange
    }));
  };

  // 3) getInvestmentDetails usa l’oggetto selezionato
  const getInvestmentDetails = (opt) => {
    if (!opt) return [];
    return [
      { label: 'Simbolo', value: opt.value },
      { label: 'Nome', value: opt.name },
      { label: 'Exchange', value: opt.exchange },
      { label: 'Tipo', value: opt.type }
    ];
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
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              onChange={option => setSelectedOption(option)}      // 4) setta l’oggetto completo
              placeholder="Cerca simboli (es. AAPL)…"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '16px'
                })
              }}
            />
          </div>
        </div>
      </div>

      <CombinedInvestmentChart 
        symbol={selectedOption.value}                     // 5) passa symbol e name
        investmentName={selectedOption.name}
      />

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
              {getInvestmentDetails(selectedOption).map((detail, index) => (
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
