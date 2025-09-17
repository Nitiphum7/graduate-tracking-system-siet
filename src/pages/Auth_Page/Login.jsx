import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../hooks/useAuth.js'; // ตรวจสอบว่า import ถูกต้อง
import logo from '../../assets/images/logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // ดึงฟังก์ชัน login มาจาก Context

  // URL ของ Server API (ควรย้ายไปเก็บในไฟล์ .env ในโปรเจคจริง)
  const API_URL = 'http://localhost:3000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. ส่ง Request ไปยัง Server API
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. รับข้อมูลที่ Server ตอบกลับมา
      const data = await response.json();

      // 3. ตรวจสอบว่า Server ตอบกลับมาว่าสำเร็จหรือไม่
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
      }
      
      // --- ล็อกอินสำเร็จ ---

      // 4. เรียกใช้ฟังก์ชัน login จาก Context เพื่อจัดการข้อมูลทั้งหมด
      // บรรทัดนี้จะทำการบันทึก token, user ลง localStorage และอัปเดต state ส่วนกลาง
      login(data.user, data.token);

      // 5. นำทางผู้ใช้ไปยังหน้าถัดไป
      const { role_name: role, has_signed } = data.user;

      if (role === 'admin') {
        navigate('/admin');
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

            <button type="submit">🚀 เข้าสู่ระบบ</button>
            {error && <p className={styles.errorMsg}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;