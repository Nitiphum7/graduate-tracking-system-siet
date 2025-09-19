import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../User_Page/DocumentDetailPage.module.css';

// Import Component สำหรับแสดงรายละเอียดฟอร์มต่างๆ
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';
import FinalSubmissionDetail from '../../components/document-details/FinalSubmissionDetail';

// Import Component เฉพาะของหน้า Admin
import AdminActionCard from '../../components/admin/AdminActionCard';
import WorkflowTimeline from '../../components/admin/WorkflowTimeline';

// Map สำหรับเลือก Component ที่จะแสดงผลตามประเภทเอกสาร
const detailComponentMap = {
    1: Form1Detail,
    2: Form2Detail,
    3: Form3Detail,
    4: Form4Detail,
    5: Form5Detail,
    6: Form6Detail,
    7: ExamResultDetail,
    8: FinalSubmissionDetail,

};

function AdminDocumentDetailPage() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const { user: adminUser } = useAuth();
    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        const loadDocumentData = async () => {
            if (!docId) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/submissions/${docId}`);
                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดข้อมูลเอกสารได้");
                }
                const data = await response.json();
                
                // จุดที่ 1: ต้องแน่ใจว่าเก็บ data.studentProfile ลง state
                setDocData({
                    document: {
                        ...data.documentDetail.form_details,
                        ...data.documentDetail 
                    },
                    user: data.documentDetail,
                    advisors: data.advisors,
                    studentProfile: data.studentProfile 
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadDocumentData();
    }, [docId]);

    const handleAction = async (action, adminComment) => {
        if (!adminUser) {
            alert("ไม่พบข้อมูลแอดมิน, กรุณาล็อกอินใหม่");
            return;
        }
        const status_name = action === 'approve' ? 'อนุมัติ' : 'ตีกลับ'; 
        try {
            const response = await fetch(`${API_URL}/api/submissions/${docId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status_name: status_name,
                    admin_comment: adminComment,
                    actor_user_id: adminUser.id
                })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
            }
            alert(`ดำเนินการ "${status_name}" สำเร็จ!`);
            navigate('/admin/home');
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูลเอกสาร...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
    if (!docData) return <div>ไม่พบข้อมูล</div>;

    // จุดที่ 2: ต้องแน่ใจว่าดึง studentProfile ออกมาจาก state
    const { document, user, advisors, studentProfile } = docData;
    const DetailComponent = detailComponentMap[document.document_type_id];

    return (
        <main className={styles.detailContainer}>
            <div className={styles.documentContent}>
                <div className={styles.contentHeader}>
                    <h1>{document.type_name}</h1>
                </div>
                <div className={styles.detailCard}>
                    {DetailComponent ? (
                        // จุดที่ 3: ต้องแน่ใจว่าส่ง studentProfile เป็น prop
                        <DetailComponent 
                            doc={document} 
                            user={user} 
                            advisors={advisors}
                            studentProfile={studentProfile}
                        />
                    ) : (
                        <p>ไม่มี Component สำหรับแสดงผลเอกสารประเภท: {document.type_name}</p>
                    )}
                </div>
            </div>
            <aside className={styles.documentSidebar}>
                <WorkflowTimeline document={document} advisors={advisors} />
                <AdminActionCard onAction={handleAction} currentStatus={document.status_name} />
                <div className={styles.detailCard}>
                    <h3>ความคิดเห็น (จากผู้ยื่น)</h3>
                    <p className={styles.commentBox}>{document.student_comment || 'ไม่มี'}</p>
                </div>
            </aside>
        </main>
    );
}

export default AdminDocumentDetailPage;