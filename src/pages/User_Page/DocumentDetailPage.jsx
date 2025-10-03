import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './DocumentDetailPage.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faThumbsUp, faThumbsDown, faHistory, faEdit, faFilePdf } from '@fortawesome/free-solid-svg-icons';

import { getSubmissionDetail, processApproval } from '../../utils/api'; 

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
    const { user: loggedInUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comment, setComment] = useState('');
    
    const SERVER_BASE_URL = 'http://localhost:3000';

    const taskId = location.state?.taskId;
    const approverRoles = ['advisor', 'program_chair', 'executive', 'assistant_rector'];
    const isApprover = loggedInUser && approverRoles.includes(loggedInUser.role_name);

    useEffect(() => {
        if (authLoading) return;
        if (!loggedInUser) {
            navigate('/login');
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            try {
                const response = await getSubmissionDetail(docId);
                setDocData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [docId, authLoading, loggedInUser, navigate]);

    const handleApprovalAction = async (status) => {
        if (!taskId) {
            alert("ข้อผิดพลาด: ไม่พบ Task ID!");
            return;
        }
        setIsSubmitting(true);
        try {
            await processApproval(taskId, status, comment);
            alert(`ดำเนินการ "${status === 'approved' ? 'อนุมัติ' : 'ตีกลับ'}" สำเร็จ!`);
            navigate('/advisor/home');
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
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

    const { documentDetail = {} } = docData;
    const DetailComponent = detailComponentMap[documentDetail.document_type_id];
    
    const canEdit = loggedInUser?.role_name === 'student' && ['ตีกลับ', 'ส่งกลับแก้ไข', 'ไม่อนุมัติ'].includes(documentDetail.status);

    return (
        <main className={styles.detailContainer}>
            <div className={styles.documentContent}>
                <div className={styles.contentHeader}>
                    <h1>{documentDetail.title || 'กำลังโหลด...'}</h1>
                </div>
                
                {/* --- ส่วนแสดงรายละเอียดเฉพาะของฟอร์ม --- */}
                <div className={styles.detailCard}>
                    {DetailComponent ? (
                        <DetailComponent 
                            doc={documentDetail} 
                            user={documentDetail}
                            advisors={docData.advisors || []}
                        />
                    ) : (
                        <p>ยังไม่มี Component สำหรับแสดงรายละเอียดของเอกสารประเภทนี้</p>
                    )}
                </div>

                
                
                {/* --- ส่วนแสดงความคิดเห็น --- */}
                <div className={styles.detailCard}>
                    <h3>ความคิดเห็นเพิ่มเติม (จากผู้ยื่น)</h3>
                    <p className={styles.commentBox}>{documentDetail.student_comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p>
                </div>
                {documentDetail.admin_comment && (
                    <div className={styles.detailCard}>
                        <h3>ความคิดเห็น/เหตุผล (จากผู้ตรวจสอบ)</h3>
                        <p className={styles.commentBox}>{documentDetail.admin_comment}</p>
                    </div>
                )}
                
                {/* --- แผงควบคุมสำหรับ Advisor --- */}
                {isApprover && taskId && (
                    <div className={`${styles.detailCard} ${styles.actionCard}`}>
                        <h3>ดำเนินการอนุมัติ</h3>
                        <textarea
                            rows="4"
                            placeholder="เพิ่มความคิดเห็น (ถ้ามี)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <div className={styles.approvalButtonGroup}>
                            <button 
                                className={styles.rejectBtn} 
                                onClick={() => handleApprovalAction('rejected')} 
                                disabled={isSubmitting}
                            >
                                <FontAwesomeIcon icon={faThumbsDown} /> ตีกลับ / ไม่อนุมัติ
                            </button>
                            <button 
                                className={styles.approveBtn} 
                                onClick={() => handleApprovalAction('approved')} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <><FontAwesomeIcon icon={faSpinner} spin /> กำลังดำเนินการ...</>
                                             : <><FontAwesomeIcon icon={faThumbsUp} /> อนุมัติ</>}
                            </button>
                        </div>
                    </div>
                )}


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
            
            {/* --- Sidebar --- */}
            <aside className={styles.documentSidebar}>
                <div className={`${styles.statusCard} ${statusClass(documentDetail.status)}`}>
                    <div className={styles.statusText}>
                        <p>สถานะปัจจุบัน</p>
                        <h2>{documentDetail.status}</h2>
                    </div>
                </div>
                {canEdit && (
                    <Link to={`/student/edit-doc/${docId}`} className={styles.editButton}>
                        <FontAwesomeIcon icon={faEdit} /> ไปที่หน้าแก้ไข
                    </Link>
                )}
                <div className={styles.detailCard}>
                    <h3>ข้อมูลการยื่น</h3>
                    <ul className={styles.infoList}>
                        <li><label>ประเภทเอกสาร:</label> <span>{documentDetail.title}</span></li>
                        <li><label>วันที่ยื่น:</label> <span>{formatThaiDateTime(documentDetail.submission_date)}</span></li>
                        <li><label>ดำเนินการล่าสุด:</label> <span>{formatThaiDateTime(documentDetail.action_date)}</span></li>
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

