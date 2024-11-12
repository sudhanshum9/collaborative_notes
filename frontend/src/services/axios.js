import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosCall = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

export default axiosCall;
