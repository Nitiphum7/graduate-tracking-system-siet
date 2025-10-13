import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import logo from '../../assets/images/logo.png';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
          
           const data = await login({ email, password });

            const { role_name: role, has_signed } = data.user;

            if (!has_signed && role !== 'admin') {
                navigate('/signature');
            } else {
                switch (role) {
                    case 'admin': navigate('/admin/home'); break;
                    case 'student': navigate('/student/home'); break;
                    case 'advisor':
                    case 'program_chair':
                    case 'executive':
                    case 'assistant_rector':
                    case 'external_professor': navigate('/advisor/home'); break;
                    default: setError("ไม่สามารถกำหนดหน้าถัดไปสำหรับบทบาทของคุณได้"); break;
                }
            }
        } catch (err) {
            // Context จะโยน error กลับมาให้ LoginPage จัดการแสดงผล
            const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
            if (err.code === "ERR_NETWORK") {
                setError('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            } else {
                setError(`❌ ${errorMessage}`);
            }
            console.error('Login failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ส่วน JSX ของฟอร์มเหมือนเดิมทั้งหมด ---
    return (
        <div className={styles.loginPageContainer}>
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <img src={logo} alt="KMITL Logo" className={styles.logo} />
                    <h1>Graduate Student Tracking System</h1>
                    <p>เข้าสู่ระบบด้วยบัญชี <strong>@kmitl.ac.th</strong> เท่านั้น</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email สถาบัน</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email สถาบัน"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">รหัสผ่าน</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="รหัสผ่าน"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : '🚀 เข้าสู่ระบบ'}
                        </button>
                        {error && <p className={styles.errorMsg}>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;