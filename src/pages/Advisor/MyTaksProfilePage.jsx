import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './MyTaksProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserTie, faChalkboardTeacher, faBriefcase, faIdCard, faSpinner, faKey,
    faSignature, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons';
import SignaturePad from 'react-signature-pad-wrapper';

// --- Account Management Component ---
const AccountManagementSection = ({ userId, token }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
            }

            setMessage({ type: 'success', text: data.message });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={styles.profileCard}>
            <h3><FontAwesomeIcon icon={faIdCard} /> จัดการบัญชี</h3>
            <form onSubmit={handleChangePassword}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="oldPassword">รหัสผ่านปัจจุบัน</label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">รหัสผ่านใหม่</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                </div>

                {message.text && (
                    <div className={`${styles.messageBox} ${message.type === 'error' ? styles.error : styles.success}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><FontAwesomeIcon icon={faSpinner} spin /> กำลังบันทึก...</>
                        ) : (
                            <><FontAwesomeIcon icon={faKey} /> เปลี่ยนรหัสผ่าน</>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
};

// --- Helper Function ---
const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    const clean = ('' + phone).replace(/\D/g, '');
    const match = clean.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return match[1] + '-' + match[2] + '-' + match[3];
    }
    return phone;
};

// --- Main Component ---
function MyTasksProfilePage() {
    const { user: authUser, loading: authLoading, token } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [assignedPrograms, setAssignedPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
    const signaturePadRef = useRef(null);
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        const loadProfileData = async () => {
            if (authLoading) return;
            if (!authUser) { navigate('/login'); return; }
            
            setLoading(true);
            setError(null);
            
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const response = await fetch(`${API_URL}/api/advisor/profile`, { headers });
                
                if (!response.ok) {
                    if (response.status === 403 || response.status === 401) {
                        navigate('/login');
                        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    }
                    throw new Error(`Failed to fetch data (Status: ${response.status})`);
                }

                const data = await response.json();
                setProfileData(data.profile);
                setAssignedPrograms(data.programs);

            } catch (err) {
                setError(err.message);
                console.error("Error loading advisor profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [authUser, authLoading, navigate, token]);

    const handleSaveSignature = async () => {
        if (!profileData || signaturePadRef.current?.isEmpty()) {
            alert("กรุณาวาดลายเซ็นของคุณก่อนบันทึก");
            return;
        }
        const signatureData = signaturePadRef.current.toDataURL('image/png');
        try {
            const response = await fetch(`${API_URL}/api/users/${authUser.id}/signature`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ signatureData })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Server Error');
            
            setProfileData(prev => ({ ...prev, signature_image_url: result.data.signature_image_url, has_signed: true }));
            alert("บันทึกลายเซ็นใหม่เรียบร้อยแล้ว");
            setSignatureModalOpen(false);
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleDeleteSignature = async () => {
        if (window.confirm("คุณต้องการลบลายเซ็นดิจิทัลใช่หรือไม่?")) {
            try {
                const response = await fetch(`${API_URL}/api/users/${authUser.id}/signature`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('ไม่สามารถลบลายเซ็นได้');
                
                setProfileData(prev => ({ ...prev, signature_image_url: null, has_signed: false }));
                alert("ลบลายเซ็นเรียบร้อยแล้ว");
            } catch(err) {
                alert(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        }
    };

    if (loading || authLoading) return <div className={styles.loadingText}><FontAwesomeIcon icon={faSpinner} spin /> กำลังโหลด...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!profileData) return <div className={styles.loadingText}>ไม่พบข้อมูลโปรไฟล์อาจารย์</div>;

    const fullname = `${profileData.prefix_th || ''}${profileData.first_name_th || ''} ${profileData.last_name_th || ''}`.trim();
    
    return (
        <>
            <main className={styles.profileContainer}>
                <h1><FontAwesomeIcon icon={faUserTie} /> โปรไฟล์อาจารย์</h1>
                <div className={styles.profileLayout}>
                    <div className={styles.mainProfileColumn}>
                        <section className={styles.profileCard}>
                            <h3>ข้อมูลส่วนตัวและการติดต่อ</h3>
                            <div className={styles.detailsGrid}>
                                <div><label>ชื่อ-นามสกุล (ไทย):</label><span>{fullname}</span></div>
                                <div><label>รหัสอาจารย์:</label><span>{profileData.advisor_id || '-'}</span></div>
                                <div><label>อีเมล (Login):</label><span>{profileData.email || '-'}</span></div>
                                <div><label>ตำแหน่งวิชาการ:</label><span>{profileData.academic_position || '-'}</span></div>
                                <div><label>ประเภทอาจารย์:</label><span>{profileData.advisor_type || '-'}</span></div>
                                <div><label>สถานที่ทำงาน:</label><span>{profileData.office_location || '-'}</span></div>
                                <div><label>เบอร์โทรศัพท์:</label><span>{formatPhoneNumber(profileData.phone)}</span></div>
                            </div>
                        </section>
                        <AccountManagementSection userId={authUser.id} token={token} />
                    </div>
                    <div className={styles.sideProfileColumn}>
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faBriefcase} /> บทบาทการอนุมัติ</h3>
                            <ul className={styles.roleList}>
                                {profileData.roles && Array.isArray(profileData.roles) && profileData.roles.length > 0 ? (
                                    profileData.roles.map((role, index) => <li key={index}>{role}</li>)
                                ) : (
                                    <li>ไม่มีบทบาทการอนุมัติเพิ่มเติม</li>
                                )}
                            </ul>
                        </section>
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faChalkboardTeacher} /> หลักสูตรที่รับผิดชอบ</h3>
                            <ul className={styles.programList}>
                                {assignedPrograms.length > 0 ? (
                                    assignedPrograms.map((program) => (
                                        <li key={program.id}>
                                            <span className={styles.programName}>{program.name}</span>
                                            <span className={styles.programLevel}>({program.degree_level})</span>
                                        </li>
                                    ))
                                ) : (
                                    <li>ไม่มีหลักสูตรที่ได้รับมอบหมาย</li>
                                )}
                            </ul>
                        </section>
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faSignature} /> ลายเซ็นดิจิทัล</h3>
                            <div className={styles.signatureDisplayArea}>
                                {profileData.signature_image_url ? (
                                    <img src={`${API_URL}${profileData.signature_image_url}`} alt="ลายเซ็น" />
                                ) : (
                                    <p>ยังไม่มีลายเซ็นในระบบ</p>
                                )}
                            </div>
                            <div className={styles.signatureActions}>
                                <button className={styles.btn} onClick={() => setSignatureModalOpen(true)}>
                                    <FontAwesomeIcon icon={faEdit} /> แก้ไขลายเซ็น
                                </button>
                                <button 
                                    className={`${styles.btn} ${styles.btnDanger}`} 
                                    onClick={handleDeleteSignature} 
                                    disabled={!profileData.signature_image_url}
                                >
                                    <FontAwesomeIcon icon={faTrash} /> ลบลายเซ็น
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {isSignatureModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalBox} ${styles.signatureModalBox}`}>
                        <h3>แก้ไขลายเซ็นดิจิทัล</h3>
                        <div className={styles.canvasWrapper}>
                            <SignaturePad 
                                ref={signaturePadRef}
                                options={{ penColor: 'black', backgroundColor: '#f8f9fa' }}
                                canvasProps={{ className: styles.signatureCanvas }} 
                            />
                        </div>
                        <div className={styles.modalActionsStacked}>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setSignatureModalOpen(false)}>ยกเลิก</button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSignature}>บันทึก</button>
                            </div>
                            <div className={styles.secondaryActions}>
                                <button className={styles.btnText} onClick={() => signaturePadRef.current?.clear()}>ล้าง</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MyTasksProfilePage;