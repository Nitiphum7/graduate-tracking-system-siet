import React, { useEffect, useReducer, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { getStudentDashboard } from '../../utils/api';


// --- Card Components ---

function StatusSummaryCard({ counts }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>ภาพรวมเอกสาร</h3>
      <div className={styles.statusBoxes}>
        <div className={`${styles.box} ${styles.pending}`}><span>กำลังดำเนินการ</span><strong>{counts.pending || 0}</strong></div>
        <div className={`${styles.box} ${styles.rejected}`}><span>ตีกลับ</span><strong>{counts.rejected || 0}</strong></div>
        <div className={`${styles.box} ${styles.approved}`}><span>อนุมัติ</span><strong>{counts.approved || 0}</strong></div>
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
        <Link to="/student/exam-submit" className={styles.quickLinkBtn}>ยื่นผลสอบภาษาอังกฤษ</Link>
        <Link to="/student/templates" className={styles.quickLinkBtn}>ดาวน์โหลดเทมเพลต</Link>
      </div>
    </div>
  );
}

function NextStepCard({ approvedDocs, rejectedDocs }) {
  let nextStepContent = null;

  if (rejectedDocs && rejectedDocs.length > 0) {
    nextStepContent = (
      <div className={`${styles.nextStepBody} ${styles.alert}`}>
        <span className={styles.actionTitle}>⚠️ มีเอกสารที่ต้องแก้ไข</span>
        <p>ระบบพบว่าคุณมีเอกสารที่ถูกส่งกลับ ({rejectedDocs.length} รายการ)</p>
        <Link to="/student/status" className={styles.actionButton}>ไปที่หน้าสถานะเอกสาร</Link>
      </div>
    );
  } else if (approvedDocs) {
    const hasApprovedId = (id) => approvedDocs.some(doc => doc.document_type_id === id);
    const hasApprovedAnyId = (ids) => approvedDocs.some(doc => ids.includes(doc.document_type_id));

    // --- ตรวจสอบสถานะของแต่ละฟอร์ม ---
    const isForm1Approved = hasApprovedId(1);
    const isForm2Approved = hasApprovedId(2);
    const isForm3Approved = hasApprovedId(3);
    const isForm4Approved = hasApprovedId(4);
    const isForm5Approved = hasApprovedId(5);
    const isForm6Approved = hasApprovedId(6);
    const isEnglishApproved = hasApprovedAnyId([7, 8]);

    // --- Logic การแสดงผลตามลำดับใหม่: ฟอร์ม 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> ผลสอบอังกฤษ ---
    if (!isForm1Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>ยื่นขออาจารย์ที่ปรึกษา</span><p>แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</p><Link to="/student/form1" className={styles.actionButton}>ไปที่ฟอร์ม 1</Link></div>;
    } else if (!isForm2Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>เสนอหัวข้อวิทยานิพนธ์</span><p>แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา</p><Link to="/student/form2" className={styles.actionButton}>ไปที่ฟอร์ม 2</Link></div>;
    } else if (!isForm3Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>นำส่งเล่มเค้าโครง</span><p>แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม</p><Link to="/student/form3" className={styles.actionButton}>ไปที่ฟอร์ม 3</Link></div>;
    } else if (!isForm4Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>ขอหนังสือเชิญผู้ทรงคุณวุฒิ</span><p>แแบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย</p><Link to="/student/form4" className={styles.actionButton}>ไปที่ฟอร์ม 4</Link></div>;
    } else if (!isForm5Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>ขออนุญาตเก็บข้อมูล</span><p>แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)</p><Link to="/student/form5" className={styles.actionButton}>ไปที่ฟอร์ม 5</Link></div>;
    } else if (!isForm6Approved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>ยื่นขอสอบวิทยานิพนธ์ สุดท้าย</span><p>ยื่นขอสอบวิทยานิพนธ์ขั้นสุดท้าย</p><Link to="/student/form6" className={styles.actionButton}>ไปที่ฟอร์ม 6</Link></div>;
    } else if (!isEnglishApproved) {
      nextStepContent = <div className={styles.nextStepBody}><span className={styles.actionTitle}>ยื่นผลการทดสอบภาษาอังกฤษ</span><p>ขั้นตอนสุดท้ายคือการยื่นผลคะแนนการทดสอบความสามารถทางภาษาอังกฤษ</p><Link to="/student/exam-submit" className={styles.actionButton}>ไปที่หน้ายื่นผลสอบ</Link></div>;
    } else {
      // ทำครบทุกอย่างแล้ว
      nextStepContent = (
        <div className={`${styles.nextStepBody} ${styles.done}`}>
          <span className={styles.actionTitle}>🎉 ขอแสดงความยินดี!</span>
          <p>คุณได้ดำเนินการในขั้นตอนสำคัญครบถ้วนแล้ว</p>
          <Link to="/student/status" className={styles.actionButton}>ดูสถานะเอกสารทั้งหมด</Link>
        </div>
      );
    }
  } else {
    nextStepContent = <div className={styles.nextStepBody}><p>กำลังโหลดข้อมูลขั้นตอนต่อไป...</p></div>;
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
        {documents && documents.length > 0 ? (
          documents.slice(0, 5).map((doc) => (
            <li key={doc.doc_id}>
              <Link to={`/student/docs/${doc.doc_id}`} className={styles.docTitle}>{doc.title}</Link>
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

// --- Main HomePage Component ---

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, isError: false, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, isError: false, data: action.payload, error: null };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, isError: true, error: action.payload };
    default:
      throw new Error('Invalid action type');
  }
};

function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    data: null,
    error: null,
  });
  
  const loadDashboard = useCallback(async (userId) => {
    dispatch({ type: 'FETCH_INIT' });
    try {
      // ⭐ 3. เรียกใช้ฟังก์ชันจาก api.js ที่มีการแนบ Token อัตโนมัติ ⭐
      const response = await getStudentDashboard(userId);
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    if (!user) {
      navigate('/login');
      return;
    }

    loadDashboard(user.id);

  }, [user, authLoading, navigate, loadDashboard]);

  if (authLoading || state.isLoading) {
    return <div className={styles.loading}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }

  if (state.isError) {
    return <div className={styles.error}>เกิดข้อผิดพลาด: {state.error}</div>;
  }
  
  if (!state.data) {
    return <div className={styles.error}>ไม่สามารถแสดงข้อมูลได้</div>;
  }

  const { name, counts, approvedDocs, rejectedDocs, allDocuments } = state.data;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>ยินดีต้อนรับ, {name}!</h1>
        <p>ภาพรวมความคืบหน้าและสิ่งที่ต้องดำเนินการสำหรับคุณ</p>
      </div>
      <div className={styles.dashboardLayout}>
        <div className={styles.mainColumn}>
          <NextStepCard 
            approvedDocs={approvedDocs} 
            rejectedDocs={rejectedDocs} 
          />
          <RecentActivitiesCard documents={allDocuments} />
        </div>
        <div className={styles.sideColumn}>
          <StatusSummaryCard counts={counts} />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  );
}

export default HomePage;