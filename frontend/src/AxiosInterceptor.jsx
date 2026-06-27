import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AxiosInterceptor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.warn("Session expired or forbidden. Clearing user data and redirecting.");
                    localStorage.removeItem('user');
                    alert("Your session has expired. Please log in again to continue.");
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    return null; 
};

export default AxiosInterceptor;