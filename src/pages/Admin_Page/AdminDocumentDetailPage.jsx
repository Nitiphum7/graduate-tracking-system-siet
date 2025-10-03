import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../User_Page/DocumentDetailPage.module.css'; // ใช้ CSS ร่วมกัน
import { useAuth } from '../../hooks/useAuth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';
import AdminWorkflowCard from '../../components/admin/AdminWorkflowCard';


const detailComponentMap = {
    1: Form1Detail,
    2: Form2Detail,
    3: Form3Detail,
    4: Form4Detail,
    5: Form5Detail,
    6: Form6Detail,
    7: ExamResultDetail,
    8: ExamResultDetail,
    9: ExamResultDetail,
};

const formatThaiDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
    }) + ' น.';
};

function AdminDocumentDetailPage() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const { user: adminUser, token } = useAuth();
    
    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        if (!adminUser) return;

        const loadDocumentData = async () => {
            setLoading(true);
            try {
                if (!docId) throw new Error("ไม่พบ ID ของเอกสาร");
                // ✅ ดึงข้อมูลจาก Endpoint ที่รวมทุกอย่างแล้ว
                const response = await fetch(`${API_URL}/api/submissions/${docId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error(`ไม่สามารถดึงข้อมูลเอกสารได้ (Error: ${response.status})`);
                }
                const data = await response.json();
                setDocData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadDocumentData();
    }, [docId, adminUser, token]);

    const handleAction = async (newStatus, adminComment) => {
        if (!window.confirm(`คุณต้องการ "${newStatus}" เอกสารนี้ใช่หรือไม่?`)) return;
        try {
            const response = await fetch(`${API_URL}/api/submissions/${docId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status_name: newStatus,
                    admin_comment: adminComment,
                    actor_user_id: adminUser.id,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server Error');
            }
            alert(`ดำเนินการ "${newStatus}" เอกสารเรียบร้อยแล้ว`);
            navigate('/admin/home');
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };
    
    if (loading) return <div className={styles.loadingText}>กำลังโหลด...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!docData) return <div>ไม่พบข้อมูล</div>;

    // ✅ แตกตัวแปรทั้งหมดออกมาจาก State
    const { documentDetail = {}, advisors = [], programs = [], departments = [], allUserDocs = [] } = docData || {};
    const DetailComponent = detailComponentMap[documentDetail.document_type_id];

    // สร้าง object สำหรับ user/studentProfile ที่จะส่งต่อ
    const userProfileData = {
        ...documentDetail,
        fullname: `${documentDetail.prefix_th || ''} ${documentDetail.first_name_th || ''} ${documentDetail.last_name_th || ''}`.trim()
    };

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.detailContainer}>
                <div className={styles.documentContent}>
                    <div className={styles.detailCard}>
                        {DetailComponent ? (
                            // ✅ ส่ง props ทั้งหมดที่จำเป็นไปให้ Component ลูก
                            <DetailComponent 
                                doc={documentDetail} 
                                user={userProfileData}
                                studentProfile={userProfileData}
                                advisors={advisors}
                                programs={programs}
                                departments={departments}
                                allUserDocs={allUserDocs}
                            />
                        ) : (
                            <p>ไม่มีรายละเอียดเพิ่มเติมสำหรับเอกสารประเภทนี้</p>
                        )}
                    </div>
                </div>
                <aside className={styles.documentSidebar}>
                    <AdminWorkflowCard
                        document={documentDetail}
                        onAction={handleAction}
                    />
                    <div className={`${styles.detailCard} ${styles.historyCard}`}>
                        <h3 className={styles.header}>
                            <FontAwesomeIcon icon={faHistory} /> ประวัติการดำเนินการ
                        </h3>
                        <div className={styles.historyList}>
                            {documentDetail?.history?.length > 0 ? (
                                documentDetail.history.map((log, index) => (
                                    <div key={index} className={styles.historyItem}>
                                        <div className={styles.historyAction}>
                                            <strong>{log.actor_name}</strong> {log.action}
                                        </div>
                                        <div className={styles.historyDate}>
                                            {formatThaiDateTime(log.log_date)}
                                        </div>
                                        {log.log_comment && (
                                            <div className={styles.historyComment}>
                                                <strong>เหตุผล:</strong> {log.log_comment}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>ไม่มีประวัติการดำเนินการ</p>
                            )}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default AdminDocumentDetailPage;