import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './DocumentDetailPage.module.css';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Form1Detail from '../../components/document-details/Form1Detail';
// import Form2Detail from '../../components/document-details/Form2Detail';

// --- 1. แก้ไข Map ให้ใช้ ID เป็น Key ---
const detailComponentMap = {
  1: Form1Detail,  // Key คือ document_type_id ของ 'ฟอร์ม 1'
  // 2: Form2Detail, // Key คือ document_type_id ของ 'ฟอร์ม 2'
};

const formatThaiDateTime = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  }) + ' น.';
};

function DocumentDetailPage() {
  const { docId } = useParams();
  const { user: loggedInUser, loading: authLoading } = useAuth();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    if (authLoading) return;
    if (!loggedInUser) {
        setError("กรุณาล็อกอินเพื่อดูข้อมูล");
        setLoading(false);
        return;
    }

    const loadDocumentDetail = async () => {
      try {
        if (!docId) throw new Error("ไม่พบ ID ของเอกสาร");

        const response = await fetch(`${API_URL}/api/submissions/${docId}`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "ไม่สามารถดึงข้อมูลเอกสารได้");
        }
        
        const data = await response.json();
        
        setDocData({ 
          document: {
            ...data.documentDetail.form_details,
            doc_id: data.documentDetail.id,
            type_id: data.documentDetail.document_type_id, // <-- 2. เพิ่ม type_id เข้ามา
            type: data.documentDetail.type_name,
            title: data.documentDetail.type_name,
            student_comment: data.documentDetail.student_comment,
            submitted_date: data.documentDetail.submission_date,
            status: data.documentDetail.status_name,
          }, 
          user: data.documentDetail,
          advisors: data.advisors,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocumentDetail();
  }, [docId, loggedInUser, authLoading]);

  if (loading || authLoading) return <div className={styles.loadingText}>กำลังโหลดรายละเอียด...</div>;
  if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
  if (!docData) return <div>ไม่พบข้อมูลเอกสาร</div>;

  const { document, user, advisors } = docData;

  // --- 3. แก้ไข Logic การหา Component ให้ใช้ ID ---
  const DetailComponent = detailComponentMap[document.type_id];

  const statusClass = (docStatus) => {
    const approved = ['อนุมัติ', 'ผ่าน', 'อนุมัติแล้ว', 'ผ่านเกณฑ์'];
    const rejected = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่านเกณฑ์'];
    if (approved.includes(docStatus)) return styles.approved;
    if (rejected.includes(docStatus)) return styles.rejected;
    return styles.pending;
  };

  return (
    <main className={styles.detailContainer}>
      <div className={styles.documentContent}>
        <div className={styles.contentHeader}>
          <h1>{document.title}</h1>
          <Link to="/student/status" className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} /> กลับหน้ารวมสถานะ
          </Link>
        </div>
        
        <div className={styles.detailCard}>
          {DetailComponent ? (
            <DetailComponent doc={document} user={user} advisors={advisors} />
          ) : (
            <p>ไม่มีรายละเอียดเพิ่มเติมสำหรับเอกสารประเภทนี้</p>
          )}
        </div>

        <div className={styles.detailCard}>
          <h3>ความคิดเห็นเพิ่มเติม (จากผู้ยื่น)</h3>
          <p className={styles.commentBox}>{document.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
        </div>
      </div>

      <aside className={styles.documentSidebar}>
         <div className={`${styles.statusCard} ${statusClass(document.status)}`}>
            <div className={styles.statusText}>
                <p>สถานะปัจจุบัน</p>
                <h2>{document.status}</h2>
            </div>
         </div>
         <div className={styles.detailCard}>
            <h3>ข้อมูลการยื่น</h3>
            <ul className={styles.infoList}>
                <li><label>ประเภทเอกสาร:</label> <span>{document.type}</span></li>
                <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(document.submitted_date)}</span></li>
                <li><label>วันที่อนุมัติ/ส่งกลับ:</label> <span>-</span></li>
            </ul>
         </div>
      </aside>
    </main>
  );
}

export default DocumentDetailPage; // <-- บรรทัดนี้ต่อท้ายสุดของไฟล์