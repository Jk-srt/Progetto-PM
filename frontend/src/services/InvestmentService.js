import axios from 'axios';
const API_URL = 'https://backproject.azurewebsites.net/api/investments';

class InvestmentService {
	// recupera tutti gli investimenti
	getAll() {
		return axios.get(API_URL, {
			headers: {
				'userId': localStorage.getItem('userId')  // Add userId header to GET request
			}
		});
	}
	// recupera un investimento per id
	get(id) {
		return axios.get(`${API_URL}/${id}`, {
			headers: {
				'userId': localStorage.getItem('userId')
			}
		});
	}
	// crea un nuovo investimento
	create(investment) {
		return axios.post(API_URL, investment, {
			headers: { 
				'Content-Type': 'application/json',
				'userId': localStorage.getItem('userId')
			}
		});
	}
	// aggiorna un investimento esistente
	update(id, data) {
		return axios.put(`${API_URL}/${id}`, data, {
			headers: {
				'userId': localStorage.getItem('userId')
			}
		});
	}
	// elimina un investimento
	delete(id) {
		return axios.delete(`${API_URL}/${id}`, {
			headers: {
				'userId': localStorage.getItem('userId')
			}
		});
	}
}

const investmentService = new InvestmentService();

export default investmentService;
