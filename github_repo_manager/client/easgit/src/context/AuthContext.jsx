import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
        }
        setLoading(false);
    }, []);

    const login = async (code) => {
        try {
            console.log('Making API request to:', `${API_BASE_URL}/auth/github/callback`);
            console.log('With code:', code.substring(0, 10) + '...');
            
            const response = await axios.post(`${API_BASE_URL}/auth/github/callback`, { code });
            console.log('API response received:', response.status);
            
            const { token, user } = response.data;
            console.log('User authenticated:', user?.login);
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return true;
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
