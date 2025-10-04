import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง
import axios from 'axios';
import styles from './MyRolesPage.module.css';
import { FaUsers } from 'react-icons/fa';

const MyRolesPage = () => {
    const { user } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyRoles = async () => {
            if (!user) {
                setLoading(true);
                return;
            }
            
            if (!user.advisor_id) {
                setRoles([]);
                setError("คุณไม่มีรหัสอาจารย์ (advisor_id) ในระบบ");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `/api/advisors/${user.advisor_id}/roles`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRoles(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching my roles:", err);
                setError(`ไม่สามารถดึงข้อมูลบทบาทได้: ${err.response?.statusText || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRoles();
        
    }, [user]);

    const renderContent = () => {
        if (loading) {
            return <tr><td colSpan="4" className={styles.loadingText}>กำลังโหลดข้อมูล...</td></tr>;
        }
        if (error) {
            return <tr><td colSpan="4" className={styles.errorText}>{error}</td></tr>;
        }
        if (roles.length === 0) {
            return <tr><td colSpan="4" className={styles.noDataText}>ไม่พบข้อมูลบทบาทที่เกี่ยวข้องกับนักศึกษา</td></tr>;
        }
        return roles.map((item, index) => (
            <tr key={item.submission_id || `role-${index}`}>
                <td>
                    {/* 🎯 FIX: เปลี่ยนจาก Link เป็น div ธรรมดา */}
                    <div className={styles.studentName}>{item.student_name}</div>
                    <div className={styles.studentId}>{item.student_id}</div>
                </td>
                <td>{item.program_name || '-'}</td>
                <td className={styles.roleCell}>{item.role}</td>
                <td>{item.document_title !== 'N/A' ? item.document_title : '-'}</td>
            </tr>
        ));
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1><FaUsers /> บทบาทของเอกสาร</h1>
                <p>ภาพรวมความสัมพันธ์ทั้งหมดที่คุณมีต่อนักศึกษาในระบบ</p>
            </header>

            <div className={styles.tableContainer}>
                <h2 className={styles.tableTitle}>รายการบทบาททั้งหมด</h2>
                <table>
                    <thead>
                        <tr>
                            <th>นักศึกษา</th>
                            <th>หลักสูตร</th>
                            <th>บทบาท</th>
                            <th>เกี่ยวข้องกับเอกสาร</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderContent()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRolesPage;