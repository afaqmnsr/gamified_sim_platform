import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        const { data } = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password },
            { withCredentials: true }
        );

        localStorage.setItem('token', data.token);
        await fetchUser(); // fetch fresh user details
    };

    
    const register = async (name, email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', 
            { name, email, password },
            { withCredentials: true }
        );
        localStorage.setItem('token', data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            setUser(data);
        } catch (err) {
            logout();
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const refreshAccessToken = async () => {
    try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('token', data.token);
        return data.token;
    } catch (err) {
        logout();
        throw err;
    }
};

export const useAuth = () => useContext(AuthContext);
