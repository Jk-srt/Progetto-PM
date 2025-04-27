import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Container, Row, Col, Card, Alert, Table, Button, Spinner } from 'react-bootstrap';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Transactions from './TransactionsPage';
import NewsPage from './NewsPage';
import AssistantPage from './AssistantPage';
import PortfolioAnalytics from '../components/PortfolioAnalytics';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeInvestmentTab, setActiveInvestmentTab] = useState('overview');
  const [data, setData] = useState({
    transactions: [],
    investments: [],
    categories: []
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    labels: [],
    datasets: [{
      label: 'Rendimento',
      data: [],
      borderColor: '#4e73df',
      tension: 0.4
    }]
  });

  // Migliore palette per la torta
  const portfolioAllocationData = {
    labels: ['Azioni', 'Obbligazioni', 'ETF', 'Cripto'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
      borderColor: '#222',
      borderWidth: 2
    }]
  };

  // Migliora la generazione dei dati performance (ordinamento, etichette)
  const generatePerformanceData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Rendimento',
          data: [],
          borderColor: '#4e73df',
          tension: 0.4
        }]
      };
    }

    const monthlySums = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlySums[monthYear]) monthlySums[monthYear] = 0;
      monthlySums[monthYear] += transaction.amount;
    });

    const monthlyData = Object.entries(monthlySums)
        .map(([key, value]) => {
          const [month, year] = key.split('/');
          return {
            date: new Date(parseInt(year), parseInt(month) - 1, 1),
            amount: value
          };
        })
        .sort((a, b) => a.date - b.date);

    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const labels = monthlyData.map(item => `${monthNames[item.date.getMonth()]} ${item.date.getFullYear()}`);
    const data = monthlyData.map(item => item.amount);

    return {
      labels,
      datasets: [{
        label: 'Rendimento',
        data,
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4e73df'
      }]
    };
  };

  // Opzioni grafiche migliorate
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa' },
        grid: { color: '#333' }
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: '#333' }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const [transactions, investments, categories] = await Promise.all([
          fetch('http://localhost:5000/api/transactions', { headers: { userId } }).then(res => res.json()),
          fetch('http://localhost:5000/api/investments', { headers: { userId } }).then(res => res.json()),
          fetch('http://localhost:5000/api/categories', { headers: { userId } }).then(res => res.json())
        ]);
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        setData({ transactions, investments, categories });
        setPerformanceData(generatePerformanceData(transactions));
        localStorage.setItem('categories', JSON.stringify(categories));
        setTotal(totalAmount);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Card riutilizzabile per KPI
  const KpiCard = ({ title, value, color = 'primary' }) => (
      <Card className="mb-4 shadow-sm" style={{ borderLeft: `4px solid var(--bs-${color})` }}>
        <Card.Body>
          <Card.Title className="mb-2" style={{ fontWeight: 600 }}>{title}</Card.Title>
          <h4 className={`text-${color}`}>{value}</h4>
        </Card.Body>
      </Card>
  );

  // Tab investimenti migliorata
  const renderInvestmentContent = () => {
    switch (activeInvestmentTab) {
      case 'overview':
        return (
            <Row className="mt-3">
              <Col md={6}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <Card.Title>Allocazione Portafoglio</Card.Title>
                    <Pie data={portfolioAllocationData} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <Card.Title>Performance Storiche</Card.Title>
                    <Line data={performanceData} options={chartOptions} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
        );
      case 'analytics':
        return <PortfolioAnalytics data={data.investments} />;
      case 'transactions':
        return (
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>Storico Operazioni</Card.Title>
                <div className="d-flex justify-content-end mb-3">
                  <Button
                      variant="success"
                      onClick={() => navigate('/add-investment')}
                  >
                    Aggiungi Investimento
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                      <th>Data</th>
                      <th>Asset</th>
                      <th>Tipo</th>
                      <th>Quantità</th>
                      <th>Prezzo</th>
                      <th>Totale</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.investments.map((investment) => (
                        <tr key={investment.id}>
                          <td>{new Date(investment.date).toLocaleDateString()}</td>
                          <td>{investment.asset}</td>
                          <td>{investment.type}</td>
                          <td>{investment.quantity}</td>
                          <td>${investment.price.toFixed(2)}</td>
                          <td>${(investment.quantity * investment.price).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
        <Container className="text-center mt-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h6>Caricamento dati in corso...</h6>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="text-center mt-4">
          <Alert variant="danger">
            Errore nel caricamento dei dati. Riprovare più tardi.
          </Alert>
        </Container>
    );
  }

  return (
      <Container className="mt-4">
        <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            id="main-tabs"
            className="mb-3"
            justify
        >
          <Tab eventKey="dashboard" title="Dashboard" />
          <Tab eventKey="transactions" title="Transazioni" />
          <Tab eventKey="investments" title="Investimenti" />
          <Tab eventKey="news" title="Notizie" />
          <Tab eventKey="assistente" title="Assistente" />
        </Tabs>

        {activeTab === 'dashboard' && (
            <>
              <h4 className="mb-4">Panoramica Finanziaria</h4>
              <Row>
                <Col md={4}>
                  <KpiCard title="Patrimonio Totale" value={`$${total.toFixed(2)}`} color="primary" />
                  <Card className="mb-4 shadow-sm">
                    <Card.Body>
                      <Card.Title className="mb-3">Andamento Mensile</Card.Title>
                      <Line data={performanceData} options={chartOptions} />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card className="mb-4 shadow-sm">
                    <Card.Body>
                      <Card.Title>Ultime Transazioni</Card.Title>
                      <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                          <thead>
                          <tr>
                            <th>Data</th>
                            <th>Descrizione</th>
                            <th>Categoria</th>
                            <th>Importo</th>
                          </tr>
                          </thead>
                          <tbody>
                          {data.transactions.slice(0, 10).map((transaction, index) => (
                              <tr key={index}>
                                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.category?.name || 'N/A'}</td>
                                <td className={transaction.amount < 0 ? 'text-danger' : 'text-success'}>
                                  ${transaction.amount.toFixed(2)}
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </Table>
                      </div>
                      <div className="d-flex justify-content-end">
                        <Button variant="outline-primary" size="sm" onClick={() => setActiveTab('transactions')}>
                          Vedi tutte
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
        )}

        {activeTab === 'investments' && (
            <>
              <Tabs
                  activeKey={activeInvestmentTab}
                  onSelect={setActiveInvestmentTab}
                  id="investments-tabs"
                  className="mb-3"
                  justify
              >
                <Tab eventKey="overview" title="Sintesi" />
                <Tab eventKey="analytics" title="Analisi" />
                <Tab eventKey="transactions" title="Operazioni" />
              </Tabs>
              {renderInvestmentContent()}
            </>
        )}

        {activeTab === 'transactions' && <Transactions transactions={data.transactions} />}
        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'assistente' && <AssistantPage />}
      </Container>
  );
};

export default DashboardPage;
