// src/layouts/FullWidthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../components/admin/NavbarAdmin'; 
import styles from './AdminLayout.module.css';

function FullWidthLayout() {
    return (
        <div className={styles.adminLayoutRoot}> 
            <NavbarAdmin /> 
            <div className={styles.adminPageLayout}>
                <main className={styles.mainContentFullWidth}> 
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default FullWidthLayout;