import axios from 'axios';
const API_URL = 'http://localhost:5000/api/investments';

class InvestmentService {
	// recupera tutti gli investimenti
	getAll() {
		return axios.get(API_URL);
	}
	// recupera un investimento per id
	get(id) {
		return axios.get(`${API_URL}/${id}`);
	}
	// crea un nuovo investimento
	create(investment) {
		return axios.post(API_URL, investment, {
			headers: { 'Content-Type': 'application/json',
				'userId': localStorage.getItem('userId') // aggiungi l'header userId
			 }
		});
	}
	// aggiorna un investimento esistente
	update(id, data) {
		return axios.put(`${API_URL}/${id}`, data);
	}
	// elimina un investimento
	delete(id) {
		return axios.delete(`${API_URL}/${id}`);
	}
}
export default new InvestmentService();
