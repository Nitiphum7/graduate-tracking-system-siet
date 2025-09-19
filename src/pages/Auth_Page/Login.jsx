import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import logo from '../../assets/images/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // เพิ่ม State สำหรับ Loading
  const navigate = useNavigate();
  const { login } = useAuth();
  const API_URL = 'http://localhost:3000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // เริ่ม Loading

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
      }
      
      login(data.user, data.token);

      const { role_name: role, has_signed } = data.user;

      if (role === 'admin') {
        navigate('/admin/home');
      } else if (role === 'student' || role === 'advisor' || role === 'program_chair') {
        if (has_signed) {
          navigate(`/${role}/home`);
        } else {
          navigate('/signature');
        }
      } else {
        setError("ไม่สามารถกำหนดหน้าถัดไปสำหรับบทบาทของคุณได้");
      }

    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false); // หยุด Loading
    }
  };

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
            {/* ✅ เปลี่ยนปุ่มให้แสดงสถานะ Loading */}
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