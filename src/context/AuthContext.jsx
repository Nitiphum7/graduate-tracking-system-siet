import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:3000';

    const verifyUser = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            try {
                const response = await fetch(`${API_URL}/api/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` },
                    cache: 'no-cache' 
                });
                
                if (!response.ok) {
                    throw new Error("Token is invalid or expired");
                }
                
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

            } catch (error) {
                console.error("Auth verification failed:", error);
                setUser(null);
                setToken(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    const login = (userData, userToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    const value = { user, token, loading, login, logout, verifyUser };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};