import axios from 'axios';
const API_URL = 'https://backproject.azurewebsites.net/api/investments';

// Helper function to convert camelCase to PascalCase
const toPascalCase = (obj) => {
	if (!obj) return obj;
	
	const result = {};
	Object.keys(obj).forEach(key => {
		// Convert first character to uppercase
		const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
		result[pascalKey] = obj[key];
	});
	return result;
};

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
		// Convert to PascalCase for API
		const pascalCaseInvestment = toPascalCase(investment);
		
		return axios.post(API_URL, pascalCaseInvestment, {
			headers: { 
				'Content-Type': 'application/json',
				'userId': localStorage.getItem('userId')
			}
		});
	}
	// aggiorna un investimento esistente
	update(id, data) {
		// Convert to PascalCase for API
		const pascalCaseData = toPascalCase(data);
		
		return axios.put(`${API_URL}/${id}`, pascalCaseData, {
			headers: {
				'userId': localStorage.getItem('userId')
			}
		});
	}
	// elimina un investimento
	delete(id) {
		// Convert id to string to make sure it's properly sent
		const investmentId = id.toString();
		return axios.delete(`${API_URL}/${investmentId}`, {
			headers: {
				'userId': localStorage.getItem('userId')
			}
		});
	}
	
	// Helper method to get proper casing for ID
	// Useful for handling both camelCase and PascalCase objects
	getInvestmentId(investment) {
		return investment.InvestmentId || investment.investmentId;
	}
}

const investmentService = new InvestmentService();

export default investmentService;

