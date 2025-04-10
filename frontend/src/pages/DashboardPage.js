import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Row, Col, Card, Alert, Table } from 'react-bootstrap';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeInvestmentTab, setActiveInvestmentTab] = useState('overview');
  const [data, setData] = useState({
    transactions: [],
    investments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dati per i grafici
  const portfolioAllocationData = {
    labels: ['Azioni', 'Obbligazioni', 'ETF', 'Cripto'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
    }]
  };

  const performanceData = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
    datasets: [{
      label: 'Rendimento',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#4e73df',
      tension: 0.4
    }]
  };

  // Carica dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }
        console.log("User ID:", userId);

        const [transactions, investments, categories] = await Promise.all([
          fetch('http://localhost:5000/api/transactions', {
            headers: { 'userId': userId }
          }).then(res => res.json()),
          fetch('http://localhost:5000/api/investments', {
            headers: { 'userId': userId }
          }).then(res => res.json()),
          fetch('http://localhost:5000/api/categories').then(res => res.json())
        ]);
        console.log("Categories:", categories);
        console.log("Transactions:", transactions);
        console.log("Investments:", investments);
        localStorage.setItem('categories', JSON.stringify(categories));
        setData({ transactions, investments });
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Renderizza il contenuto della sezione Investimenti
  const renderInvestmentContent = () => {
    switch (activeInvestmentTab) {
      case 'overview':
        return (
          <Row className="mt-3">
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Allocazione Portafoglio</Card.Title>
                  <Pie data={portfolioAllocationData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Performance Storiche</Card.Title>
                  <Line data={performanceData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      case 'analytics':
        return <PortfolioAnalytics data={data.investments} />;
      case 'transactions':
        return (
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Storico Transazioni</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover>
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
      <Container className="text-center mt-4">
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
      {/* Menu principale */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="main-tabs"
        className="mb-3"
      >
        <Tab eventKey="dashboard" title="Dashboard" />
        <Tab eventKey="transactions" title="Transazioni" />
        <Tab eventKey="investments" title="Investimenti" />
        <Tab eventKey="news" title="Notizie" />
        <Tab eventKey="assistant" title="Assistente" />
      </Tabs>

      {/* Contenuto principale */}
      {activeTab === 'dashboard' && (
        <>
          <h4 className="mb-4">Panoramica Finanziaria</h4>
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Patrimonio Totale</Card.Title>
                  <h4 className="text-primary mb-3">$25,430.00</h4>
                  <Line data={performanceData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Ultime Transazioni</Card.Title>
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrizione</th>
                          <th>Categoria</th>
                          <th>Importo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category?.name || 'N/A'}</td>
                            <td>${transaction.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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
            onSelect={(k) => setActiveInvestmentTab(k)}
            id="investments-tabs"
            className="mb-3"
          >
            <Tab eventKey="overview" title="Panoramica" />
            <Tab eventKey="analytics" title="Analisi" />
            <Tab eventKey="transactions" title="Transazioni" />
          </Tabs>
          {renderInvestmentContent()}
        </>
      )}

      {activeTab === 'transactions' && <Transactions transactions={data.transactions} />}
      {activeTab === 'news' && <NewsPage />}
      {activeTab === 'assistant' && <AssistantPage />}
    </Container>
  );
};

export default DashboardPage;
