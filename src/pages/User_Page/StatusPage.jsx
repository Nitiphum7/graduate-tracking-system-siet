import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StatusPage.module.css';
import StatusColumn from '../../components/StatusColumn';
import { useAuth } from '../../hooks/useAuth.js'; 

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
        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const response = await fetch("/data/student.json");
        const students = await response.json();
        const currentUser = students.find(s => s.email === userEmail);
        if (!currentUser) throw new Error("ไม่พบข้อมูลนักศึกษา");

        // 1. ดึงข้อมูลเอกสารพื้นฐานจาก student.json (ถ้ามี)
        const baseDocs = currentUser.documents || [];

        // ✅✅✅ ส่วนที่แก้ไข: ดึงข้อมูลจาก localStorage ทุกส่วน ✅✅✅
        // 2. ดึงเอกสารใหม่ที่ถูกบันทึกไว้ใน localStorage จากทุกสถานะที่เป็นไปได้
        const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        const approvedDocs = JSON.parse(localStorage.getItem('localStorage_approvedDocs') || '[]');
        const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
        const waitingAdvisorDocs = JSON.parse(localStorage.getItem('localStorage_waitingAdvisorDocs') || '[]');
        
        // 3. รวมเอกสารทั้งหมดจาก localStorage
        const allLocalStorageDocs = [
            ...pendingDocs, 
            ...approvedDocs, 
            ...rejectedDocs, 
            ...waitingAdvisorDocs
        ];
        
        // 4. กรองเอาเฉพาะเอกสารของ user ที่ login อยู่
        const userLocalStorageDocs = allLocalStorageDocs.filter(doc => doc.student_email === userEmail);
        
        // 5. รวมข้อมูลจาก student.json และ localStorage เข้าด้วยกัน
        // (อาจมีข้อมูลซ้ำกัน ถ้ามีเอกสารตัวเดียวกันใน student.json และ localStorage, ต้องมีวิธีจัดการในอนาคต)
        const allDocs = [...baseDocs, ...userLocalStorageDocs];
        // --- จบส่วนที่แก้ไข ---

        // --- ส่วนที่เหลือทำงานเหมือนเดิม ---
        const approvedStates = ['อนุมัติแล้ว', 'อนุมัติ', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ส่งกลับแก้ไข', 'ไม่ผ่านเกณฑ์'];

        // ใช้ new Set เพื่อกรองเอกสารที่ซ้ำกันออก (กรองจาก doc_id)
        const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.doc_id, doc])).values());

        const approved = uniqueDocs.filter(doc => approvedStates.includes(doc.status));
        const rejected = uniqueDocs.filter(doc => rejectedStates.includes(doc.status));
        const pending = uniqueDocs.filter(doc => !approvedStates.includes(doc.status) && !rejectedStates.includes(doc.status));
        
        const sortByDate = (a, b) => new Date(b.submitted_date || 0) - new Date(a.submitted_date || 0);
        approved.sort(sortByDate);
        pending.sort(sortByDate);
        rejected.sort(sortByDate);

        setDocuments({ approved, pending, rejected });

      } catch (err) {
        setError(err.message);
      }
    };

    loadStatusData();
  }, []); // Dependency array ว่างเปล่า หมายความว่า Effect นี้จะทำงานครั้งเดียวเมื่อ Component โหลด

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