import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './DocumentDetailPage.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHistory } from '@fortawesome/free-solid-svg-icons';

// Import Components
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';

const detailComponentMap = {
    1: Form1Detail, 2: Form2Detail, 3: Form3Detail, 4: Form4Detail,
    5: Form5Detail, 6: Form6Detail, 7: ExamResultDetail, 8: ExamResultDetail, 9: ExamResultDetail,
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
    const { user: loggedInUser, loading: authLoading, token } = useAuth();
    const navigate = useNavigate();
    
    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        if (authLoading || !loggedInUser) return;
        
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/submissions/${docId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลได้ (Error: ${response.status})`);
                const allDataFromApi = await response.json();
                setDocData(allDataFromApi);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [docId, authLoading, loggedInUser, navigate, token]);

    // ✅✅✅ เพิ่มฟังก์ชัน statusClass ที่หายไปกลับเข้ามา ✅✅✅
    const statusClass = (statusName) => {
        if (!statusName) return styles.pending;
        const approved = ['อนุมัติ', 'อนุมัติแล้ว', 'ผ่าน', 'ผ่านเกณฑ์'];
        const rejected = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่านเกณฑ์', 'ส่งกลับแก้ไข'];
        if (approved.includes(statusName)) return styles.approved;
        if (rejected.includes(statusName)) return styles.rejected;
        return styles.pending;
    };

    if (loading || authLoading) return <div className={styles.loadingText}>กำลังโหลด...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!docData) return <div>ไม่พบข้อมูลเอกสาร</div>;
    
    const { documentDetail = {}, advisors = [], allUserDocs = [] } = docData || {};
    const DetailComponent = detailComponentMap[documentDetail.document_type_id];
    
    const userProfileData = {
        ...documentDetail,
        fullname: `${documentDetail.prefix_th || ''} ${documentDetail.first_name_th || ''} ${documentDetail.last_name_th || ''}`.trim()
    };

    return (
        <main className={styles.detailContainer}>
            <div className={styles.documentContent}>
                <div className={styles.contentHeader}>
                    <h1>{documentDetail.title || 'กำลังโหลด...'}</h1>
                    <Link to="/student/status" className={styles.backLink}>
                        <FontAwesomeIcon icon={faArrowLeft} /> กลับหน้ารวมสถานะ
                    </Link>
                </div>
                <div className={styles.detailCard}>
                    {DetailComponent ? (
                        <DetailComponent 
                            doc={documentDetail} 
                            user={userProfileData}
                            advisors={advisors}
                            allUserDocs={allUserDocs}
                        />
                    ) : (
                        <p>ยังไม่มี Component สำหรับแสดงรายละเอียดของเอกสารประเภทนี้</p>
                    )}
                </div>
                <div className={styles.detailCard}>
                    <h3>ความคิดเห็นเพิ่มเติม (จากผู้ยื่น)</h3>
                    <p className={styles.commentBox}>{documentDetail.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
                </div>
                {documentDetail.admin_comment && (
                    <div className={styles.detailCard}>
                        <h3>ความคิดเห็น/เหตุผล (จากเจ้าหน้าที่)</h3>
                        <p className={styles.commentBox}>{documentDetail.admin_comment}</p>
                    </div>
                )}
            </div>
            <aside className={styles.documentSidebar}>
               <div className={`${styles.statusCard} ${statusClass(documentDetail.status)}`}>
                   <div className={styles.statusText}>
                       <p>สถานะปัจจุบัน</p>
                       <h2>{documentDetail.status}</h2>
                   </div>
               </div>
               <div className={styles.detailCard}>
                    <h3>ข้อมูลการยื่น</h3>
                    <ul className={styles.infoList}>
                        <li><label>ประเภทเอกสาร:</label> <span>{documentDetail.title}</span></li>
                        <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(documentDetail.submission_date)}</span></li>
                        <li><label>วันที่ดำเนินการล่าสุด:</label> <span>{formatThaiDateTime(documentDetail.action_date)}</span></li>
                    </ul>
               </div>
                <div className={styles.detailCard}>
                    <h3><FontAwesomeIcon icon={faHistory} /> ประวัติการดำเนินการ</h3>
                    <ul className={styles.historyList}>
                        {documentDetail.history && documentDetail.history.length > 0 ? (
                            documentDetail.history.map((log, index) => (
                                <li key={index}>
                                    <div className={styles.logAction}>{log.action}</div>
                                    <div className={styles.logActor}>โดย: {log.actor_name}</div>
                                    <div className={styles.logDate}>{formatThaiDateTime(log.log_date)}</div>
                                    {log.log_comment && <p className={styles.logComment}><b>เหตุผล:</b> {log.log_comment}</p>}
                                </li>
                            ))
                        ) : (
                            <li>ยังไม่มีประวัติการดำเนินการ</li>
                        )}
                    </ul>
                </div>
            </aside>
        </main>
    );
}

export default DocumentDetailPage;