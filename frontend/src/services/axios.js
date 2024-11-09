import axios from 'axios';

const axiosCall = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' }
});

export default axiosCall;
