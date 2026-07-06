import axios from 'axios';
import config from './config';

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: config.server_origin, // Adjust base URL as needed
  withCredentials: true, // Send cookies when cross-domain requests are made
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN', // The cookie name to read CSRF token from
  xsrfHeaderName: 'X-XSRF-TOKEN', // The header name to send CSRF token in
});

// Add a request interceptor
api.interceptors.request.use(
async  (config) => {
    // You can attach tokens or modify the config before the request is sent
    // Example: 
    // const token = localStorage.getItem('token');
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error('Unauthorized access - perhaps the token expired?');
    }
    return Promise.reject(error);
  }
);

export default api;