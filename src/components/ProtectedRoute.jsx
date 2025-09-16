// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. ถ้าระบบกำลังโหลดข้อมูลผู้ใช้ ให้ยังไม่แสดงอะไร
    if (loading) {
        return <div>Loading...</div>; // หรือจะใช้ Spinner สวยๆ ก็ได้
    }

    // 2. ถ้าโหลดเสร็จแล้ว และ "ไม่พบ" ข้อมูลผู้ใช้ ให้เด้งไปหน้า Login
    if (!user) {
        // เราส่ง state ไปด้วย เพื่อบอกว่าหลังจาก Login สำเร็จให้กลับมาหน้านี้
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. ถ้าโหลดเสร็จแล้ว และ "พบ" ข้อมูลผู้ใช้ ให้แสดงหน้าที่ต้องการได้เลย
    return children;
};

export default ProtectedRoute;