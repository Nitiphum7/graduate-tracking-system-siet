import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StatusPage.module.css';
import StatusColumn from '../../components/StatusColumn';
import { useAuth } from '../../context/AuthContext'; 

function StatusPage() {
  const { user, loading } = useAuth(); // <-- 1. ดึง loading มาจาก Context ด้วย
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  const [documents, setDocuments] = useState({ approved: [], pending: [], rejected: [] });
  // แก้ไข: ไม่ต้องมี state loading ของตัวเองแล้ว ใช้จาก Context แทน
  const [error, setError] = useState(null);

  useEffect(() => {
    // 3. จะยังไม่ทำอะไรเลยถ้า Context ยังโหลดไม่เสร็จ
    if (loading) {
      return; 
    }
    // 4. หลังจากโหลดเสร็จแล้ว ค่อยเช็กว่ามี user หรือไม่
    if (!user) {
      navigate('/login');
      return;
    }

    const loadStatusData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/submissions/student/${user.id}`);
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลสถานะเอกสารได้");
        }
        const allDocsFromServer = await response.json();

        // ... (ส่วนจัดกลุ่มเอกสารเหมือนเดิม) ...
        const approvedStates = ['อนุมัติ', 'ผ่าน', 'อนุมัติแล้ว', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่านเกณฑ์'];
        const approved = allDocsFromServer.filter(doc => approvedStates.includes(doc.status_name));
        const rejected = allDocsFromServer.filter(doc => rejectedStates.includes(doc.status_name));
        const pending = allDocsFromServer.filter(doc => !approvedStates.includes(doc.status_name) && !rejectedStates.includes(doc.status_name));
        setDocuments({ approved, pending, rejected });

      } catch (err) {
        setError(err.message);
      }
    };

    loadStatusData();
  }, [user, loading, navigate]); // <-- 5. เพิ่ม loading เข้าไปใน dependency array

  // 2. แสดงสถานะ "กำลังตรวจสอบ" ระหว่างที่ Context กำลังเช็ค localStorage
  if (loading) return <div className={styles.loadingText}>กำลังตรวจสอบสิทธิ์...</div>;
  if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <main className={styles.statusPageContainer}>
      <h1>📄 สถานะเอกสารของคุณ</h1>
      <div className={styles.statusGrid}>
        <StatusColumn title="❌ ไม่อนุมัติ / ต้องแก้ไข" statusType="rejected" documents={documents.rejected} />
        <StatusColumn title="⌛ กำลังดำเนินการ" statusType="pending" documents={documents.pending} />
        <StatusColumn title="✔️ อนุมัติแล้ว" statusType="approved" documents={documents.approved} />
      </div>
    </main>
  );
}

export default StatusPage;