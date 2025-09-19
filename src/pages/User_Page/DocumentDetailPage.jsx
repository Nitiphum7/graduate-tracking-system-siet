import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './DocumentDetailPage.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// 1. Import Component ทั้งหมดให้ครบ
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import FinalSubmissionDetail from '../../components/document-details/FinalSubmissionDetail'; // Import component ใหม่

// 2. เพิ่มรายการสำหรับเอกสารใหม่เข้าไปใน Map
const detailComponentMap = {
    1: Form1Detail,
    2: Form2Detail,
    3: Form3Detail,
    4: FinalSubmissionDetail, // สมมติว่า ID ของ "แบบนำส่งเล่ม" คือ 4
    // เพิ่ม ID ของเอกสารประเภทอื่นๆ ตามที่มีในระบบ
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
    const loadDocumentDetail = async () => {
      try {
        if (!docId) throw new Error("ไม่พบ ID ของเอกสารใน URL");

        const userEmail = localStorage.getItem("current_user");
        if (!userEmail) throw new Error("ไม่พบข้อมูลผู้ใช้");

        const response = await fetch("/data/student.json");
        const students = await response.json();
        const currentUser = students.find(s => s.email === userEmail);
        if(!currentUser) throw new Error("ไม่พบข้อมูลผู้ใช้ปัจจุบันในระบบ");

        // ✅✅✅ ส่วนที่แก้ไข: ดึงข้อมูลจาก localStorage ทุกส่วน ✅✅✅
        const baseDocs = currentUser.documents || [];
        // 1. ดึงข้อมูลจากทุก "ตู้" ใน localStorage
        const pendingDocs = JSON.parse(localStorage.getItem('localStorage_pendingDocs') || '[]');
        const approvedDocs = JSON.parse(localStorage.getItem('localStorage_approvedDocs') || '[]');
        const rejectedDocs = JSON.parse(localStorage.getItem('localStorage_rejectedDocs') || '[]');
        const waitingAdvisorDocs = JSON.parse(localStorage.getItem('localStorage_waitingAdvisorDocs') || '[]');
        
        // 2. รวมเอกสารทั้งหมดจาก localStorage และกรองเฉพาะของ User คนปัจจุบัน
        const allLocalStorageDocs = [
            ...pendingDocs, 
            ...approvedDocs, 
            ...rejectedDocs, 
            ...waitingAdvisorDocs
        ].filter(doc => doc.student_email === userEmail);

        // 3. รวมเอกสารทั้งหมดจากทุกแหล่ง
        const allUserDocuments = [...baseDocs, ...allLocalStorageDocs];
        const uniqueUserDocuments = Array.from(new Map(allUserDocuments.map(doc => [doc.doc_id, doc])).values());

        // 4. ค้นหาเอกสารจากรายการที่รวมทั้งหมดแล้ว
        const document = uniqueUserDocuments.find(doc => doc.doc_id === docId);
        if (!document) throw new Error("ไม่พบข้อมูลเอกสาร");
        // --- จบส่วนที่แก้ไข ---

        const [advisors, programs, departments] = await Promise.all([
          fetch("/data/advisor.json").then(res => res.json()),
          fetch("/data/structures/programs.json").then(res => res.json()),
          fetch("/data/structures/departments.json").then(res => res.json()),
        ]);
        
        setDocData({ 
          document, 
          user: {
            ...currentUser,
            fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim()
          }, 
          advisors, 
          programs, 
          departments,
          allUserDocs: uniqueUserDocuments
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocumentDetail();
  }, [docId]);

    if (loading || authLoading) return <div className={styles.loadingText}>กำลังโหลดรายละเอียด...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!docData) return <div>ไม่พบข้อมูลเอกสาร</div>;

    const { document, user, advisors, studentProfile } = docData;

    // --- ✅ DEBUG LOG 2: ดู ID ที่ใช้เลือก Component ---
    console.log("Using document_type_id to select component:", document.document_type_id);
    
    const DetailComponent = detailComponentMap[document.document_type_id];

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
                    <h1>{document.type_name}</h1>
                    <Link to="/student/status" className={styles.backLink}>
                        <FontAwesomeIcon icon={faArrowLeft} /> กลับหน้ารวมสถานะ
                    </Link>
                </div>
                
                <div className={styles.detailCard}>
                    {DetailComponent ? (
                        <DetailComponent 
                            doc={document} 
                            user={user} 
                            advisors={advisors}
                            studentProfile={studentProfile}
                        />
                    ) : (
                        // --- ✅ DEBUG LOG 3: ข้อความนี้จะแสดงถ้าหา Component ไม่เจอ ---
                        <p>หา Component ไม่เจอ! ไม่พบรายการสำหรับ ID: {document.document_type_id} ใน detailComponentMap</p>
                    )}
                </div>

                <div className={styles.detailCard}>
                    <h3>ความคิดเห็นเพิ่มเติม (จากผู้ยื่น)</h3>
                    <p className={styles.commentBox}>{document.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
                </div>
            </div>

            <aside className={styles.documentSidebar}>
               <div className={`${styles.statusCard} ${statusClass(document.status_name)}`}>
                    <div className={styles.statusText}>
                        <p>สถานะปัจจุบัน</p>
                        <h2>{document.status_name}</h2>
                    </div>
               </div>
               <div className={styles.detailCard}>
                    <h3>ข้อมูลการยื่น</h3>
                    <ul className={styles.infoList}>
                        <li><label>ประเภทเอกสาร:</label> <span>{document.type_name}</span></li>
                        <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(document.submission_date)}</span></li>
                        <li><label>วันที่อนุมัติ/ส่งกลับ:</label> <span>{formatThaiDateTime(document.action_date)}</span></li>
                    </ul>
               </div>
            </aside>
        </main>
    );
}

export default DocumentDetailPage;

