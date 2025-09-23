import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StatusPage.module.css';
import StatusColumn from '../../components/StatusColumn';
import { useAuth } from '../../hooks/useAuth.js'; 

function StatusPage() {
  const { user, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  const [documents, setDocuments] = useState({ approved: [], pending: [], rejected: [] });
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return; 
    }
    if (!user) {
      navigate('/login');
      return;
    }

    const loadStatusData = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/submissions/student/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสถานะเอกสารได้');
        }

        const allDocsFromServer = await response.json();
        
        const approvedStates = ['อนุมัติ', 'อนุมัติแล้ว', 'ผ่าน', 'ผ่านเกณฑ์'];
        const rejectedStates = ['ไม่อนุมัติ', 'ตีกลับ', 'ส่งกลับแก้ไข', 'ไม่ผ่านเกณฑ์'];

        const approved = [];
        const rejected = [];
        const pending = [];

        // ✅✅✅  ส่วนที่แก้ไข ✅✅✅
        // ลบส่วน formattedDocs ออก และใช้ allDocsFromServer โดยตรง
        // เพื่อให้ข้อมูลมี key เป็น id, type_name, submission_date ตรงตามที่ StatusColumn ต้องการ
        
        allDocsFromServer.forEach(doc => {
            if (approvedStates.includes(doc.status_name)) {
                approved.push(doc);
            } else if (rejectedStates.includes(doc.status_name)) {
                rejected.push(doc);
            } else {
                pending.push(doc);
            }
        });
        
        const sortByDate = (a, b) => new Date(b.submission_date || 0) - new Date(a.submission_date || 0);
        approved.sort(sortByDate);
        pending.sort(sortByDate);
        rejected.sort(sortByDate);

        setDocuments({ approved, pending, rejected });

      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    loadStatusData();
    
  }, [user, authLoading, navigate, token]);

  if (authLoading || isFetching) {
    return <main className={styles.statusPageContainer}><p className={styles.loadingText}>กำลังโหลดข้อมูล...</p></main>;
  }

  if (error) {
    return <main className={styles.statusPageContainer}><p className={styles.errorText}>เกิดข้อผิดพลาด: {error}</p></main>;
  }

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