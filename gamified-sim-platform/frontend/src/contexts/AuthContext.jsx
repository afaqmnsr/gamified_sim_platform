import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const fetchUserWithToken = async (token) => {
    try {
        const { data } = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
        });
        return data;
    } catch (err) {
        throw err;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 🆕

    const login = async (email, password) => {
        const { data } = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password },
            { withCredentials: true }
        );

        localStorage.setItem('token', data.token);
        await fetchUser(); // fetch fresh user details
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', 
            { name, email, password },
            { withCredentials: true }
        );
        localStorage.setItem('token', data.token);
        setUser(data.user);
    };

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false); // 🆕 still finish loading even if no token
            return;
        }

        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setUser(data);
        } catch (err) {
            logout();
        } finally {
            setLoading(false); // 🆕 mark as done
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const refreshAccessToken = async () => {
    
    try {
        const { data } = await axios.post(
            'http://localhost:5000/api/auth/refresh',
            {},
            { withCredentials: true }
        );
        localStorage.setItem('token', data.token);
        await fetchUserWithToken(data.token);
        return data.token;
    } catch (err) {
        // localStorage.removeItem('token');
        // window.location.href = '/login'; // or use a router to navigate
        throw err;
    }
};

export const useAuth = () => useContext(AuthContext);
