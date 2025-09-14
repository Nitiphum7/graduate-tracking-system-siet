import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate
import styles from './HomePage.module.css';

// --- Card Components (ไม่มีการเปลี่ยนแปลง) ---
function StatusSummaryCard({ counts }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>ภาพรวมเอกสาร</h3>
      <div className={styles.statusBoxes}>
        <div className={`${styles.box} ${styles.rejected}`}><span>ตีกลับ</span><strong>{counts.rejected}</strong></div>
        <div className={`${styles.box} ${styles.pending}`}><span>กำลังดำเนินการ</span><strong>{counts.pending}</strong></div>
        <div className={`${styles.box} ${styles.rejected}`}><span>ตีกลับ</span><strong>{counts.rejected}</strong></div>
        <div className={`${styles.box} ${styles.approved}`}><span>อนุมัติ</span><strong>{counts.approved}</strong></div>
      </div>
      <Link to="/student/status" className={styles.viewAllLink}>ดูสถานะเอกสารทั้งหมด →</Link>
    </div>
  );
}

function QuickLinksCard() {
  return (
    <div className={styles.dashboardCard}>
      <h3>ทางลัด (Quick Links)</h3>
      <div className={styles.quickLinks}>
        <Link to="/student/form1" className={styles.quickLinkBtn}>ยื่นขอที่ปรึกษา (ฟอร์ม 1)</Link>
        <Link to="/student/form2" className={styles.quickLinkBtn}>ยื่นเสนอหัวข้อ (ฟอร์ม 2)</Link>
        <Link to="/student/eng" className={styles.quickLinkBtn}>ยื่นผลสอบอังกฤษ</Link>
        <Link to="/student/templates" className={styles.quickLinkBtn}>ดาวน์โหลดเทมเพลต</Link>
      </div>
    </div>
  );
}

function NextStepCard({ approvedDocs, rejectedDocs }) {
    let nextStepContent = null;
    if (rejectedDocs.length > 0) {
      nextStepContent = (
        <div className={`${styles.nextStepBody} ${styles.alert}`}>
          <span className={styles.actionTitle}>⚠️ มีเอกสารที่ต้องแก้ไข</span>
          <p>ระบบพบว่าคุณมีเอกสารที่ถูกส่งกลับ ({rejectedDocs.length} รายการ)</p>
          <Link to="/student/status" className={styles.actionButton}>ไปที่หน้าสถานะเอกสาร</Link>
        </div>
      );
    } else {
        // แก้ไข: เช็คจาก title ที่มาจาก document_types.type_name
      const hasApproved = (formName) => approvedDocs.some(doc => doc.title && doc.title.includes(formName));
      
      if (!hasApproved('ฟอร์ม 1')) { // เช็คว่าใน title มีคำว่า 'ฟอร์ม 1' หรือไม่
        nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>เลือกอาจารย์ที่ปรึกษา</span><p>ขั้นตอนแรกคือการยื่นแบบฟอร์มเพื่อขอรับรองการเป็นอาจารย์ที่ปรึกษา</p><Link to="/student/form1" className={styles.actionButton}>ไปที่ฟอร์ม 1</Link></div>;
      } else if (!hasApproved('ฟอร์ม 2')) {
          nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>เสนอหัวข้อวิทยานิพนธ์</span><p>ขั้นตอนต่อไปคือการเสนอหัวข้อและเค้าโครงวิทยานิพนธ์</p><Link to="/student/form2" className={styles.actionButton}>ไปที่ฟอร์ม 2</Link></div>;
      } 
      else {
        nextStepContent = (
          <div className={`${styles.nextStepBody} ${styles.done}`}>
            <span className={styles.actionTitle}>👍 ยอดเยี่ยม!</span>
            <p>คุณได้ดำเนินการในขั้นตอนสำคัญครบถ้วนแล้ว</p>
            <Link to="/student/status" className={styles.actionButton}>ดูสถานะเอกสารทั้งหมด</Link>
          </div>
        );
      }
    }
    return (
      <div className={styles.dashboardCard}>
        <h3>ขั้นตอนต่อไปของคุณ (Next Step)</h3>
        {nextStepContent}
      </div>
    );
  }

function RecentActivitiesCard({ documents }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>รายการล่าสุด (Recent Activities)</h3>
      <ul className={styles.recentDocsList}>
        {documents.length > 0 ? (
          documents.slice(0, 5).map((doc) => (
            <li key={doc.doc_id}>
              {/* ใช้ doc.doc_id ที่มาจาก document_submissions.id */}
              <Link to={`/student/docs/${doc.doc_id}`} className={styles.docTitle}>{doc.title}</Link>
              {/* ปรับปรุงการแสดงผล status ให้ยืดหยุ่น */}
              <span className={`${styles.docStatus} ${styles['status-' + doc.status.toLowerCase().replace(/\s+/g, '-')]}`}>{doc.status}</span>
            </li>
          ))
        ) : (
          <li className={styles.noDocs}>ยังไม่มีประวัติการยื่นเอกสาร</li>
        )}
      </ul>
    </div>
  );
}

// --- Main HomePage Component (ส่วนที่แก้ไข) ---
function HomePage() {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. ดึงข้อมูลผู้ใช้จาก Local Storage เพื่อเอา ID
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
          throw new Error("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
        }

        // 2. เรียก API เพื่อดึงข้อมูล Dashboard ทั้งหมด
        const response = await fetch(`${API_URL}/api/dashboard/student/${storedUser.id}`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        }
        const data = await response.json();
        
        // 3. ตั้งค่า State ด้วยข้อมูลจริงจากฐานข้อมูล
        setDashboardData(data);

      } catch (err) {
        setError(err.message);
        if (err.message.includes("ล็อกอิน")) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return <div className={styles.loading}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }
  if (error) {
    return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;
  }

  // ป้องกันกรณีที่ dashboardData ยังเป็น null
  if (!dashboardData) {
      return <div className={styles.error}>ไม่สามารถแสดงข้อมูลได้</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>ยินดีต้อนรับ, {dashboardData.name}!</h1>
        <p>ภาพรวมความคืบหน้าและสิ่งที่ต้องดำเนินการสำหรับคุณ</p>
      </div>
      <div className={styles.dashboardLayout}>
        <div className={styles.mainColumn}>
          <NextStepCard 
            approvedDocs={dashboardData.approvedDocs} 
            rejectedDocs={dashboardData.rejectedDocs} 
          />
          <RecentActivitiesCard documents={dashboardData.allDocuments} />
        </div>
        <div className={styles.sideColumn}>
          <StatusSummaryCard counts={dashboardData.counts} />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  );
}

export default HomePage;