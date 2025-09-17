import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../User_Page/DocumentDetailPage.module.css'; // ใช้ CSS ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// นำเข้า Component แสดงผลของนักศึกษาทั้งหมด
import Form1Detail from '../../components/document-details/Form1Detail';
import Form2Detail from '../../components/document-details/Form2Detail';
import Form3Detail from '../../components/document-details/Form3Detail';
import Form4Detail from '../../components/document-details/Form4Detail';
import Form5Detail from '../../components/document-details/Form5Detail';
import Form6Detail from '../../components/document-details/Form6Detail';
import ExamResultDetail from '../../components/document-details/ExamResultDetail';

// นำเข้าการ์ดดำเนินการของ Admin
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import WorkflowTimeline from '../../components/admin/WorkflowTimeline';

// ✅✅✅ --- แก้ไข "สารบัญ" ตรงนี้ --- ✅✅✅
// แก้ไข Key ให้ตรงกับ type_name ในฐานข้อมูล (ลบ "(Form ...)" ออก)
const detailComponentMap = {
  'แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม': Form1Detail,
  'แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์': Form2Detail,
  'แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม': Form3Detail,
  'แบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมินคุณภาพของผลงานทางวิชาการ': Form4Detail,
  'แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล': Form5Detail,
  'บันทึกข้อความ เรื่อง ขอแต่งตั้งคณะกรรมการ': Form6Detail,
  'ยื่นผลการทดสอบความสามารถทางภาษาอังกฤษ (ป.โท)': ExamResultDetail,
  'ยื่นผลการทดสอบความสามารถทางภาษาอังกฤษ (ป.เอก)': ExamResultDetail,
  'ยื่นผลการสอบวัดคุณสมบัติ (QE)': ExamResultDetail,
};

// --- Component หลักของหน้า ---
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
                
                const formattedData = {
                    document: data.documentDetail,
                    user: data.documentDetail,
                    advisors: data.advisors,
                };
                setDocData(formattedData);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching document details:", err);
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
        try {
            const response = await fetch(`${API_URL}/api/submissions/${docId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status_name: action,
                    admin_comment: adminComment,
                    actor_user_id: adminUser.id
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
            }

            alert(`ดำเนินการ "${action}" สำเร็จ!`);
            navigate('/admin/home');

        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
            console.error("Failed to update document status:", err);
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูลเอกสาร...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
    if (!docData) return <div>ไม่พบข้อมูล</div>;

    const { document, user, ...restData } = docData;
    const DetailComponent = detailComponentMap[document.type_name];

    return (
        <main className={styles.detailContainer}>
            <div className={styles.documentContent}>
                <div className={styles.contentHeader}>
                    <h1>{document.type_name}</h1>
                </div>
                <div className={styles.detailCard}>
                    {DetailComponent ? (
                        <DetailComponent doc={document} user={user} {...restData} />
                    ) : (
                        <p>ไม่มี Component สำหรับแสดงผลเอกสารประเภท: {document.type_name}</p>
                    )}
                </div>
            </div>
            <aside className={styles.documentSidebar}>
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