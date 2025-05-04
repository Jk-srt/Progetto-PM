import React, { useState } from 'react';
import { useTheme, Grid, Card, CardContent, Typography, Paper, CardHeader } from '@mui/material';
import AsyncSelect from 'react-select/async';
import CombinedInvestmentChart from '../components/CombinedInvestmentChart';
import { fetchListingStatus } from '../services/YahooFinanceService';

const AnaliticsPage = () => {
    const [investments] = useState([]);
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState(null);

  const loadOptions = async (inputValue) => {
          if (!inputValue) {
              return investments.map(inv => ({
                  label: inv.assetName,
                  value: inv.assetName,
                  name: inv.assetName,
                  type: 'Investment',
                  exchange: 'N/A'
              }));
          }
          
          try {
              const list = await fetchListingStatus(inputValue);
              return list.map(item => ({
                  label: `${item.name} (${item.symbol})`,
                  value: item.symbol,
                  name: item.name,
                  type: item.type,
                  exchange: item.exchange
              }));
          } catch (error) {
              console.error('Error loading options:', error);
              return [];
          }
      };
  
      const getInvestmentDetails = (opt) => {
          if (!opt) return [];
          
          const investmentData = investments.find(inv => inv.assetName === opt.value);
          
          if (investmentData) {
              return [
                  { label: 'Simbolo', value: opt.value },
                  { label: 'Quantità', value: investmentData.quantity },
                  { label: 'Prezzo Acquisto', value: `€${investmentData.purchasePrice.toFixed(2)}` },
                  { label: 'Valore Attuale', value: `€${investmentData.currentTotalValue.toFixed(2)}` }
              ];
          }
          
          return [
              { label: 'Simbolo', value: opt.value },
              { label: 'Nome', value: opt.name },
              { label: 'Exchange', value: opt.exchange },
              { label: 'Tipo', value: opt.type }
          ];
      };
  
      const customSelectStyles = {
          control: (base) => ({
              ...base,
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.primary.main,
              borderRadius: '8px',
              minHeight: '48px',
              color: theme.palette.text.primary,
              boxShadow: 'none',
              '&:hover': {
                  borderColor: theme.palette.primary.dark
              }
          }),
          input: (base) => ({
              ...base,
              color: theme.palette.text.primary
          }),
          singleValue: (base) => ({
              ...base,
              color: theme.palette.text.primary
          }),
          menu: (base) => ({
              ...base,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: '8px',
              zIndex: 9999
          }),
          option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? theme.palette.action.hover : 'transparent',
              color: theme.palette.text.primary,
              '&:active': {
                  backgroundColor: theme.palette.action.selected
              }
          }),
          placeholder: (base) => ({
              ...base,
              color: theme.palette.text.secondary
          })
      };
  

  return (
    <div>
      {/* Search Bar */}
      <Card sx={{
        mb: 4,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: theme.shadows[6],
        overflow: 'hidden'
      }}>
        <CardContent sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" sx={{
            color: 'white',
            mb: 4,
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            Esplora il Mercato Azionario
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 2,
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Cerca un'azione o un altro strumento finanziario per visualizzare i dettagli e le analisi
              </Typography>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={selectedOption}
                onChange={setSelectedOption}
                placeholder="Cerca un'azione (es. AAPL, MSFT, AMZN)..."
                styles={{
                  ...customSelectStyles,
                  menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                theme={selectTheme => ({
                  ...selectTheme,
                  borderRadius: 8,
                  colors: {
                    ...selectTheme.colors,
                    primary25: theme.palette.action.hover,
                    primary: theme.palette.primary.main,
                    neutral0: theme.palette.background.paper,
                    neutral80: theme.palette.text.primary
                  }
                })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Asset Details */}
      {selectedOption && (
        <Card sx={{
          mb: 4,
          borderRadius: '16px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[4]
        }}>
          <CardHeader
            title={
              <Typography variant="h5" sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Dettagli Asset: {selectedOption.name || selectedOption.value}
              </Typography>
            }
          />
          <CardContent>
            <Typography variant="body1" sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              textAlign: 'center'
            }}>
              Esplora i dettagli dell'asset selezionato
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {getInvestmentDetails(selectedOption).map((detail, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{
                    p: 2,
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    textAlign: 'center',
                    boxShadow: theme.shadows[1],
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <Typography variant="caption" sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      letterSpacing: 1
                    }}>
                      {detail.label}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 700,
                      mt: 1
                    }}>
                      {detail.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Price Chart */}
      {selectedOption && (
        <Card sx={{
          borderRadius: '16px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[4],
          mb: 4
        }}>
          <CardHeader
            title={
              <Typography variant="h5" sx={{
                color: theme.palette.primary.main,
                fontWeight: 600
              }}>
                Analisi Prezzi di {selectedOption.name || selectedOption.value}
              </Typography>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <CombinedInvestmentChart
              symbol={selectedOption.value}
              investmentName={selectedOption.name}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnaliticsPage;
