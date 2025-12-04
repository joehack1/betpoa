import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:8000/api/' });

// Attach Authorization header if access token exists in localStorage
API.interceptors.request.use((config) => {
	try {
		const token = localStorage.getItem('access')
		if (token) {
			config.headers = config.headers || {}
			config.headers['Authorization'] = `Bearer ${token}`
		}
	} catch (e) {
		// ignore
	}
	return config
})

export default API;