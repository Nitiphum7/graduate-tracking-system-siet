import React, { useState } from 'react';
import styles from '../pages/User_Page/ProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faUserShield, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

function AccountManagementSection({ currentUser }) {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // State สำหรับข้อความสำเร็จ

  const resetForm = () => {
    setIsEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // ดึง Token สำหรับยืนยันตัวตน
      if (!token) {
        setError("Session หมดอายุ, กรุณา login ใหม่");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ส่ง Token ไปใน Header
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // ถ้า Server ตอบกลับมาว่ามีปัญหา (เช่น รหัสผ่านเก่าผิด)
        throw new Error(result.message || 'เกิดข้อผิดพลาดบางอย่าง');
      }

      // ถ้าสำเร็จ
      setSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!');
      setTimeout(() => {
        resetForm();
        setSuccess('');
      }, 2000); // หน่วงเวลา 2 วินาทีแล้วค่อยปิดฟอร์ม

    } catch (err) {
      setError(err.message);
      console.error("Password change failed:", err);
    }
  };

  return (
    <section className={styles.profileCard}>
      <h3><FontAwesomeIcon icon={faUserShield} /> การจัดการบัญชี</h3>

      {!isEditingPassword ? (
        <div className={styles.accountActions}>
          <p>จัดการข้อมูลความปลอดภัยและรหัสผ่านของคุณ</p>
          <button className={styles.btn} onClick={() => { setIsEditingPassword(true); setSuccess(''); }}>
            <FontAwesomeIcon icon={faKey} /> เปลี่ยนรหัสผ่าน
          </button>
          {success && <p className={styles.successMessage}>{success}</p>}
        </div>
      ) : (
        <form className={styles.passwordForm} onSubmit={handleSavePassword}>
          <h4>กรอกข้อมูลเพื่อเปลี่ยนรหัสผ่าน</h4>
          <div className={styles.formGroup}>
            <label htmlFor="oldPassword">รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">รหัสผ่านใหม่</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetForm}>
              <FontAwesomeIcon icon={faTimes} /> ยกเลิก
            </button>
            <button type="submit" className={styles.btn}>
              <FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AccountManagementSection;