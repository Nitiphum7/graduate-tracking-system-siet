import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/api'; // Import api instance

const API_URL = 'http://localhost:3000/api';
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);

    const updateUserState = (newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            // อัปเดต localStorage ด้วยข้อมูลล่าสุด
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    // Effect 1: ตรวจสอบ Token ตอนเปิดแอป
    useEffect(() => {
        const verifyUserOnLoad = async () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` },
                });
                setUser(response.data); // ตั้งค่า user เริ่มต้น
            } catch (error) {
                console.error("Auth verification failed, logging out:", error);
                logout();
                setLoading(false); // ⭐ สำคัญ: หยุด loading เมื่อ verify ล้มเหลว
            }
        };
        verifyUserOnLoad();
    }, [logout]);

    // Effect 2: ดึงข้อมูล Dashboard เพิ่มเติม (ทำงานแค่ครั้งเดียวหลังมี user.id)
    useEffect(() => {
        const fetchDashboardData = async (userId) => {
            try {
                const response = await api.get(`/dashboard/student/${userId}`);
                // อัปเดต user state ด้วยข้อมูลที่สมบูรณ์ขึ้น
                setUser(prevUser => ({ ...prevUser, ...response.data }));
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false); // ⭐ สำคัญ: หยุด loading เมื่อดึงข้อมูลเสร็จ (ทั้งสำเร็จและล้มเหลว)
            }
        };

        if (user?.id) {
            fetchDashboardData(user.id);
        }
    }, [user?.id]); // 👈 เฝ้าดูแค่ user.id เท่านั้น ป้องกัน Loop

    const login = async (credentials) => {
        const response = await axios.post(`${API_URL}/login`, credentials);
        if (response.data && response.data.token) {
            const { user: userData, token: userToken } = response.data;
            setUser(userData);
            setToken(userToken);
            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(userData));
        }
        return response.data;
    };

    const value = { user, token, loading, login, logout, updateUserState };

    // ไม่ต้องมี if (loading) ที่นี่ เพราะ App.js จะรอ Provider พร้อมใช้งาน
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};