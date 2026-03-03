import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Attach token and fetch user on load
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Get logged-in user
    const fetchUser = async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            setUser(data.user);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });

        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    // Register
    const register = async (name, email, password) => {
        const { data } = await api.post('/api/auth/register', { name, email, password });

        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // Update user locally
    const updateUser = (updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                token,
                login,
                register,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
