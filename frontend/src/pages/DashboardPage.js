// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';

const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Benvenuto nel Dashboard</Typography>
      </Grid>
      {data.map((item) => (
        <Grid item xs={12} md={6} key={item.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{item.title}</Typography>
              <Typography>{item.description}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardPage;
