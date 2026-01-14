import axios from 'axios';
// import router from '@/router/index'

const httpInstance = axios.create({
    baseURL: '/api/',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json',
              'Cache-Control': 'max-age=3600'
    },
    withCredentials: true
})

export default httpInstance;