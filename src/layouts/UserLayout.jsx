// src/layouts/UserLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './UserLayout.module.css';

// UserLayout เวอร์ชันใหม่ จะทำหน้าที่แค่แสดง Navbar และพื้นที่สำหรับเนื้อหาเท่านั้น
function UserLayout() {
  return (
    <div className={styles.userLayout}>
      <Navbar />
      <main className={styles.mainContent}>
        {/* Outlet คือจุดที่ Component ลูก (เช่น ProfilePage, HomePage) จะถูกแสดงผล */}
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;