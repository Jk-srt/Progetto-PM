import { Doughnut } from 'react-chartjs-2';
                
// Componente grafico a ciambella per l'allocazione del portafoglio
const PortfolioAllocationChart = () => {
    const data = {
        labels: ['Azioni', 'Obbligazioni', 'ETF', 'Fondi', 'Immobili', 'Liquidità'],
        datasets: [
            {
                label: 'Allocazione',
                data: [45, 20, 15, 10, 7, 3],
                backgroundColor: [
                    '#4BC0C0',
                    '#36A2EB',
                    '#FF6384',
                    '#FFCE56',
                    '#9966FF',
                    '#C9CBCF'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Allocazione Portafoglio',
                font: {
                    size: 16
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{height: '250px'}}>
            <Doughnut data={data} options={options}/>
        </div>
    );
};

export default PortfolioAllocationChart;