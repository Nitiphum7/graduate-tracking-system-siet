import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';

// --- Card Components (ไม่มีการเปลี่ยนแปลง) ---

function StatusSummaryCard({ counts }) {
  return (
    <div className={styles.dashboardCard}>
      <h3>ภาพรวมเอกสาร</h3>
      <div className={styles.statusBoxes}>
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
        <Link to="/student/exam-submit" className={styles.quickLinkBtn}>ยื่นผลสอบภาษาอังกฤษ</Link>
        <Link to="/student/templates" className={styles.quickLinkBtn}>ดาวน์โหลดเทมเพลต</Link>
      </div>
    </div>
  );
}

function NextStepCard({ approvedDocs, rejectedDocs }) {
  console.log('ข้อมูล approvedDocs ที่ NextStepCard ได้รับ:', approvedDocs);
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
    const hasApproved = (keyword) => approvedDocs.some(doc => doc.title && doc.title.includes(keyword));
    
    if (!hasApproved('แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม')) { 
      nextStepContent = (
        <div className={styles.nextStepBody}>
            <span className={styles.actionTitle}>ยื่นขออาจารย์ที่ปรึกษา</span>
            <p>ขั้นตอนแรกคือการยื่นแบบฟอร์มเพื่อขอรับรองการเป็นอาจารย์ที่ปรึกษา</p>
            <Link to="/student/form1" className={styles.actionButton}>ไปที่ฟอร์ม 1</Link>
        </div>
      );
    } else if (!hasApproved('เแบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา')) {
        nextStepContent = (
          <div className={styles.nextStepBody}>
              <span className={styles.actionTitle}>เสนอหัวข้อวิทยานิพนธ์</span>
              <p>ขั้นตอนต่อไปคือการเสนอหัวข้อและเค้าโครงวิทยานิพนธ์</p>
              <Link to="/student/form2" className={styles.actionButton}>ไปที่ฟอร์ม 2</Link>
          </div>
        );
    } else if (!hasApproved('แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม')) {
      nextStepContent = (
        <div className={styles.nextStepBody}>
            <span className={styles.actionTitle}>นำส่งเล่มเค้าโครง</span>
            <p>ขั้นตอนต่อไปคือการนำส่งเล่มเค้าโครงวิทยานิพนธ์ 1 เล่ม</p>
            <Link to="/student/form3" className={styles.actionButton}>ไปที่ฟอร์ม 3</Link>
        </div>
      );
    } else if (!hasApproved('แแบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย')) { 
      nextStepContent = (
        <div className={styles.nextStepBody}>
            <span className={styles.actionTitle}>ขอหนังสือเชิญผู้ทรงคุณวุฒิ</span>
            <p>ขั้นตอนต่อไปคือการยื่นเอกสารเพื่อขอหนังสือเชิญผู้ทรงคุณวุฒิ</p>
            <Link to="/student/form4" className={styles.actionButton}>ไปที่ฟอร์ม 4</Link>
        </div>
      );
    } else if (!hasApproved('แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)')) { 
      nextStepContent = (
        <div className={styles.nextStepBody}>
            <span className={styles.actionTitle}>ขออนุมัติผลสอบสมบูรณ์</span>
            <p>ขั้นตอนต่อไปคือการยื่นเอกสารเพื่อขออนุมัติผลสอบสมบูรณ์</p>
            <Link to="/student/form5" className={styles.actionButton}>ไปที่ฟอร์ม 5</Link>
        </div>
      );
    // ✅✅✅ --- แก้ไข KEYWORD ตรงนี้ --- ✅✅✅
    } else if (!hasApproved('ยื่นขอสอบวิทยานิพนธ์ขั้นสุดท้าย')) { 
      nextStepContent = (
        <div className={styles.nextStepBody}>
            <span className={styles.actionTitle}>สอบวิทยานิพนธ์ขั้นสุดท้าย</span>
            <p>ขั้นตอนต่อไปคือการยื่นเอกสารเพื่อขอสอบวิทยานิพนธ์ขั้นสุดท้าย</p>
            <Link to="/student/form6" className={styles.actionButton}>ไปที่ฟอร์ม 6</Link>
        </div>
      );
    } else {
      nextStepContent = (
        <div className={`${styles.nextStepBody} ${styles.done}`}>
          <span className={styles.actionTitle}>👍 ยอดเยี่ยม!</span>
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
    const { user, loading: authLoading, token } = useAuth();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: true,
        isError: false,
        data: null,
        error: null,
    });
    
    const loadDashboard = useCallback(async (userId, authToken) => {
        dispatch({ type: 'FETCH_INIT' });
        try {
            const response = await fetch(`http://localhost:3000/api/dashboard/student/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลแดชบอร์ดได้');
            }
            
            const data = await response.json();
            dispatch({ type: 'FETCH_SUCCESS', payload: data });

        } catch (err) {
            dispatch({ type: 'FETCH_FAILURE', payload: err.message });
        }
    }, []);

    useEffect(() => {
        if (authLoading) {
            return; 
        }

        if (!user || !token) {
            navigate('/login');
            return;
        }

        loadDashboard(user.id, token);

    }, [user, token, authLoading, navigate, loadDashboard]);

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
