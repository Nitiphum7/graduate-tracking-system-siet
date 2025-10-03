import React, { useState, useEffect } from 'react';
import styles from './AdminProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faKey, faSave, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("Authentication token not found.");
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Component สำหรับช่องใส่รหัสผ่านที่มีไอคอนลูกตา
const PasswordInput = ({ name, value, onChange, placeholder = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className={styles.passwordWrapper}>
            <input 
                type={isVisible ? 'text' : 'password'} 
                id={name}
                name={name} 
                value={value} 
                onChange={onChange} 
                required 
                placeholder={placeholder}
            />
            <button 
                type="button" 
                className={styles.eyeIcon} 
                onClick={() => setIsVisible(!isVisible)}
            >
                <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} />
            </button>
        </div>
    );
};

function AdminProfilePage() {
    // State สำหรับเก็บข้อมูลที่ดึงมาจาก API
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State สำหรับฟอร์มเปลี่ยนรหัสผ่าน
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // State สำหรับแสดงข้อความตอบกลับ (Success/Error)
    const [message, setMessage] = useState({ type: '', text: '' });

    // โหลดข้อมูลแอดมินจาก API เมื่อเปิดหน้า
    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/auth/verify', {
                    headers: getAuthHeaders()
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin data.');
                }
                const data = await response.json();
                setAdminUser({
                    email: data.email,
                    fullName: `${data.prefix_th || ''}${data.first_name_th || ''} ${data.last_name_th || ''}`.trim(),
                    role: data.role_name
                });
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
            return;
        }

        // ---  ในอนาคตจะเพิ่ม Logic การเรียก API เปลี่ยนรหัสผ่านจริงที่นี่ ---
        console.log("Submitting new password data:", passwordData);
        setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว! (จำลอง)' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    if (loading) return <div className={styles.pageContainer}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.pageContainer}>เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>โปรไฟล์ผู้ดูแลระบบ</h1>
                <p>จัดการข้อมูลส่วนตัวและเปลี่ยนรหัสผ่านของคุณ</p>
            </header>

            <div className={styles.profileLayout}>
                {/* --- ส่วนแสดงข้อมูลโปรไฟล์ (ซ้าย) --- */}
                <div className={styles.profileCard}>
                    <FontAwesomeIcon icon={faUserCircle} className={styles.profileIcon} />
                    <h2>{adminUser?.fullName || '...'}</h2>
                    <p>{adminUser?.email || '...'}</p>
                    <span className={styles.roleBadge}>
                        {adminUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : adminUser?.role}
                    </span>
                </div>

                {/* --- ส่วนตั้งค่า (ขวา) --- */}
                <div className={styles.settingsCard}>
                    <form onSubmit={handlePasswordSubmit}>
                        <fieldset className={styles.settingFieldset}>
                            <div className={styles.legendWrapper}>
                                <legend>เปลี่ยนรหัสผ่าน</legend>
                            </div>

                            {message.text && (
                                <div className={`${styles.messageBox} ${message.type === 'success' ? styles.success : styles.error}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</label>
                                <PasswordInput 
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword">รหัสผ่านใหม่</label>
                                <PasswordInput 
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
                                <PasswordInput 
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                        </fieldset>
                        <div className={styles.actions}>
                            <button type="submit" className={styles.saveButton}>
                                <FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminProfilePage;

