import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCog, faUser, faBook, faUsers, faFileAlt,
    faHistory, faArrowLeft, faSave, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// --- Sidebar Component (แก้ไขให้รับ onBack) ---
const SidebarManageStudent = ({ student, activeSection, setActiveSection, onBack }) => {
    const menuItems = [
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/การศึกษา' },
        { id: 'committee', icon: faUsers, text: 'คณะกรรมการ/ที่ปรึกษา' },
        { id: 'thesis', icon: faBook, text: 'ข้อมูลวิทยานิพนธ์' },
        { id: 'history', icon: faHistory, text: 'ประวัติการยื่นเอกสาร' },
        { id: 'publications', icon: faFileAlt, text: 'ผลงานตีพิมพ์' },
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
    ];

    return (
        <aside className={styles.sidebar}>
            {student && (
                <div className={styles.studentProfileCard}>
                    <div className={styles.studentName}>{student.first_name_th} {student.last_name_th}</div>
                    <div className={styles.studentId}>รหัสนักศึกษา: {student.student_id}</div>
                </div>
            )}
            <hr className={styles.divider} />
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
                    onClick={() => setActiveSection(item.id)}
                >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.text}</span>
                </button>
            ))}
            <hr className={styles.divider} />
            {/* ✅ ปุ่มนี้จะเรียกใช้ฟังก์ชัน onBack ที่ได้รับมา */}
            <button className={styles.sidebarBtn} onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>กลับหน้ารายชื่อ</span>
            </button>
        </aside>
    );
};

// --- Section Components (ไม่มีการแก้ไข) ---
const InfoSection = ({ formData, handleInputChange }) => (
    <>
        <div className={styles.card}>
            <h3>ข้อมูลทั่วไป</h3>
            <div className={styles.cardBody}>
                <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input name="prefix_th" type="text" value={formData.prefix_th || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input name="first_name_th" type="text" value={formData.first_name_th || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input name="last_name_th" type="text" value={formData.last_name_th || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><input name="prefix_en" type="text" value={formData.prefix_en || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>ชื่อ (อังกฤษ)</label><input name="first_name_en" type="text" value={formData.first_name_en || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>นามสกุล (อังกฤษ)</label><input name="last_name_en" type="text" value={formData.last_name_en || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>อีเมล</label><input name="email" type="email" value={formData.email || ''} disabled /></div>
                    <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} /></div>
                </div>
            </div>
        </div>
        <div className={styles.card}>
            <h3>ข้อมูลการศึกษา</h3>
            <div className={styles.cardBody}>
                <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}><label>ระดับการศึกษา</label><input name="degree" type="text" value={formData.degree || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>หลักสูตร</label><input name="program_name" type="text" value={formData.program_name || ''} onChange={handleInputChange} /></div>
                    <div className={styles.formGroup}><label>สถานะนักศึกษา</label><input name="status_name" type="text" value={formData.status_name || ''} onChange={handleInputChange} /></div>
                </div>
            </div>
        </div>
    </>
);

const CommitteeSection = ({ formData, handleInputChange, advisors }) => (
     <div className={styles.card}>
        <h3>คณะกรรมการ / อาจารย์ที่ปรึกษา</h3>
        <div className={styles.cardBody}>
            <div className={styles.formSection}>
                <h4>อาจารย์ที่ปรึกษา</h4>
                <div className={`${styles.formGrid} ${styles.threeCols}`}>
                    <div className={styles.formGroup}>
                        <label>อาจารย์ที่ปรึกษาหลัก</label>
                        <select name="main_advisor_id" value={formData.main_advisor_id || ''} onChange={handleInputChange}>
                            <option value="">-- ไม่ระบุ --</option>
                            {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>อาจารย์ที่ปรึกษาร่วม 1</label>
                        <select name="co_advisor1_id" value={formData.co_advisor1_id || ''} onChange={handleInputChange}>
                            <option value="">-- ไม่มี --</option>
                            {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                        </select>
                    </div>
                     <div className={styles.formGroup}>
                        <label>อาจารย์ที่ปรึกษาร่วม 2</label>
                        <select name="co_advisor2_id" value={formData.co_advisor2_id || ''} onChange={handleInputChange}>
                            <option value="">-- ไม่มี --</option>
                            {advisors.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HistorySection = ({ documents }) => (
    <div className={styles.card}>
        <h3>ประวัติการยื่นเอกสาร</h3>
        <div className={styles.tableWrapper}>
            <table className={styles.historyTable}>
                <thead>
                    <tr>
                        <th>ชื่อเอกสาร</th>
                        <th>วันที่ยื่น</th>
                        <th>สถานะ</th>
                        <th>ดูรายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    {documents && documents.length > 0 ? documents.map(doc => (
                        <tr key={doc.id}>
                            <td>{doc.type_name}</td>
                            <td>{new Date(doc.submission_date).toLocaleDateString('th-TH')}</td>
                            <td><span className={`${styles.statusBadge}`}>{doc.status_name}</span></td>
                            <td>
                                <Link to={`/admin/docs/${doc.id}`} className={styles.linkButton}>ดูเอกสาร</Link>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>ไม่พบประวัติการยื่นเอกสาร</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


// --- Main Page Component (แก้ไขสมบูรณ์แล้ว) ---
function ManageStudentDetailPage() {
    const { studentId } = useParams();
    const navigate = useNavigate(); // ✅ เพิ่ม useNavigate hook

    // ✅ เพิ่มฟังก์ชัน handleBackNavigation
    const handleBackNavigation = () => navigate(-1); 

    const [activeSection, setActiveSection] = useState('info');
    const [studentData, setStudentData] = useState(null);
    const [formData, setFormData] = useState({});
    const [documents, setDocuments] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/api/admin/student/${studentId}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "ไม่สามารถดึงข้อมูลนักศึกษาได้");
            }
            const result = await response.json();

            setStudentData(result.profile);
            setFormData(result.profile);
            setDocuments(result.submissions || []);
            setAdvisors(result.advisors || []);

        } catch (err) {
            console.error("Error loading student data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            loadData();
        }
    }, [studentId, loadData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/student/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถบันทึกข้อมูลได้');
            }
            
            const result = await response.json();
            
            await loadData(); // เรียกดึงข้อมูลชุดล่าสุดจาก Server!
            
            alert(result.message || 'บันทึกข้อมูลสำเร็จ!');

        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const renderSection = () => {
        if (!studentData) return null;
        switch (activeSection) {
            case 'info': return <InfoSection formData={formData} handleInputChange={handleInputChange} />;
            case 'committee': return <CommitteeSection formData={formData} handleInputChange={handleInputChange} advisors={advisors} />;
            case 'history': return <HistorySection documents={documents} />;
            // เพิ่ม case อื่นๆ ตามต้องการ (Publications, Account)
            default: return <InfoSection formData={formData} handleInputChange={handleInputChange} />;
        }
    };

    if (loading) return <div className={styles.pageContainer}><h2>กำลังโหลดข้อมูลนักศึกษา...</h2></div>;
    if (error) return <div className={styles.pageContainer}><h2>เกิดข้อผิดพลาด: {error}</h2></div>;

    return (
        <div className={styles.pageLayout}>
            <SidebarManageStudent 
                student={studentData}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onBack={handleBackNavigation} // ✅ ส่งฟังก์ชันไปเป็น prop
            />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการข้อมูลนักศึกษา</h1>
                    <button className={styles.saveButton} onClick={handleSaveChanges}><FontAwesomeIcon icon={faSave} /> บันทึกการเปลี่ยนแปลง</button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageStudentDetailPage;