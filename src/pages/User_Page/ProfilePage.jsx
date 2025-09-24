import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // 👈 1. เพิ่ม useNavigate
import styles from './ProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faTrash, faUserCircle, faGraduationCap, faSignature, faPaperclip, faPencilAlt, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import SignaturePad from 'react-signature-pad-wrapper';

// --- Helper Functions (เหมือนเดิม) ---
const formatThaiDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusClass = (status) => {
    if (!status) return styles.pending;
    const approved = ['สำเร็จการศึกษา', 'อนุมัติแล้ว', 'อนุมัติ', 'ผ่าน', 'ผ่านเกณฑ์'];
    if (approved.includes(status)) return styles.approved;
    const rejected = ['ไม่อนุมัติ', 'ตีกลับ', 'ไม่ผ่าน', 'ไม่ผ่านเกณฑ์'];
    if (rejected.includes(status)) return styles.rejected;
    return styles.pending;
};

// --- Main Component ---
function ProfilePage() {
    const { user: authUser } = useAuth();
    const navigate = useNavigate(); // 👈 2. เรียกใช้งาน useNavigate
    const [currentUser, setCurrentUser] = useState(null);
    const [processedData, setProcessedData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:3000';
    
    // ... (UI States และ Modal States เหมือนเดิม) ...
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [profileImage, setProfileImage] = useState('/assets/images/placeholder.png');
    const [signatureImage, setSignatureImage] = useState(null);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropModalOpen, setCropModalOpen] = useState(false);
    const cropperRef = useRef(null);
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
    const [signatureTab, setSignatureTab] = useState('draw');
    const signaturePadRef = useRef(null);
    const signatureFileInputRef = useRef(null);


    useEffect(() => {
        const loadProfileData = async () => {
            if (!authUser) { setLoading(false); return; }
            setLoading(true);
            try {
                // ✅✅✅ --- ส่วนที่แก้ไข --- ✅✅✅
                // 1. ดึง Token จาก Local Storage
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No token found!");
                    navigate('/login'); // ถ้าไม่มี token ให้ไปหน้า login
                    return;
                }

                // 2. สร้าง Headers สำหรับยืนยันตัวตน
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // 3. แนบ Headers ไปกับทุก fetch request
                const responses = await Promise.all([
                    fetch(`${API_URL}/api/profile/${authUser.id}`, { headers }),
                    fetch(`${API_URL}/api/advisors`, { headers }),
                    fetch(`${API_URL}/api/submissions/student/${authUser.id}`, { headers })
                ]);
                // ✅✅✅ --- จบส่วนที่แก้ไข --- ✅✅✅

                for (const res of responses) {
                    if (!res.ok) throw new Error(`Failed to fetch data (status: ${res.status})`);
                }

                const [userProfile, advisors, allUserDocuments] = await Promise.all(
                    responses.map(res => res.json())
                );
                
                // ... (ส่วนประมวลผลข้อมูลที่เหลือเหมือนเดิม) ...
                const findAdvisorName = (advisorId) => {
                    if (!advisorId) return '-';
                    const advisor = advisors.find(a => a.advisor_id === advisorId);
                    return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : '-';
                };
                const approvedStatusList = ['อนุมัติแล้ว', 'อนุมัติ', 'ผ่าน', 'ผ่านเกณฑ์'];
                const approvedDocs = allUserDocuments.filter(doc => approvedStatusList.includes(doc.status_name));
                const approvedEngMasterDoc = approvedDocs.find(doc => doc.type_name.includes('ภาษาอังกฤษ') && doc.type_name.includes('ป.โท'));
                const approvedEngPhdDoc = approvedDocs.find(doc => doc.type_name.includes('ภาษาอังกฤษ') && doc.type_name.includes('ป.เอก'));
                const approvedQEDoc = approvedDocs.find(doc => doc.type_name.includes('วัดคุณสมบัติ'));

                setCurrentUser(userProfile);
                setPhoneInput(userProfile.phone || '');
                setSignatureImage(userProfile.signature_image_url ? `${API_URL}${userProfile.signature_image_url}` : null);
                
                const savedProfileImg = localStorage.getItem(`${userProfile.email}_profile_image`);
                if (savedProfileImg) setProfileImage(savedProfileImg);

                setProcessedData({
                    mainAdvisorName: findAdvisorName(userProfile.main_advisor_id),
                    coAdvisor1Name: findAdvisorName(userProfile.co_advisor1_id),
                    coAdvisor2Name: findAdvisorName(userProfile.co_advisor2_id),
                    approvedEngMasterDoc,
                    approvedEngPhdDoc,
                    approvedQEDoc,
                    allApprovedFiles: approvedDocs.map(doc => ({ name: doc.type_name, type: 'เอกสารอนุมัติ', formTitle: doc.type_name })),
                });

            } catch (err) {
                setError(err.message);
                console.error("Error loading profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [authUser, navigate]); // 👈 3. เพิ่ม navigate เข้าไปใน dependency array

    // --- Event Handlers (เพิ่มการส่ง Token) ---
    const handleSavePhone = async () => {
        if (!currentUser) return;
        try {
            const token = localStorage.getItem('token'); // ✅ ดึง Token
            const response = await fetch(`${API_URL}/api/profile/${currentUser.id}/phone`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ ส่ง Token
                },
                body: JSON.stringify({ phone: phoneInput })
            });
            if (!response.ok) throw new Error('ไม่สามารถบันทึกเบอร์โทรศัพท์ได้');
            setCurrentUser(prev => ({ ...prev, phone: phoneInput }));
            alert("เบอร์โทรศัพท์ถูกบันทึกแล้ว");
            setIsEditingPhone(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveSignature = async () => {
        if (!currentUser) return;
        let signatureData = null;
        if (signatureTab === 'draw') {
            if (signaturePadRef.current?.isEmpty()) return alert("กรุณาวาดลายเซ็นของคุณ");
            signatureData = signaturePadRef.current.toDataURL('image/png');
        } else {
            const file = signatureFileInputRef.current?.files[0];
            if (!file) return alert("กรุณาเลือกไฟล์รูปภาพ");
            signatureData = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
        try {
            const token = localStorage.getItem('token'); // ✅ ดึง Token
            const response = await fetch(`${API_URL}/api/users/${currentUser.id}/signature`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ ส่ง Token
                },
                body: JSON.stringify({ signatureData })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Server Error');
            setSignatureImage(`${API_URL}${result.data.signature_image_url}`);
            alert("บันทึกลายเซ็นใหม่เรียบร้อยแล้ว");
            setSignatureModalOpen(false);
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleDeleteSignature = async () => {
        if (window.confirm("คุณต้องการลบลายเซ็นดิจิทัลใช่หรือไม่?")) {
            if (!currentUser) return;
            try {
                const token = localStorage.getItem('token'); // ✅ ดึง Token
                const response = await fetch(`${API_URL}/api/users/${currentUser.id}/signature`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` } // ✅ ส่ง Token
                });
                if (!response.ok) throw new Error('ไม่สามารถลบลายเซ็นได้');
                setSignatureImage(null);
                alert("ลบลายเซ็นเรียบร้อยแล้ว");
                setSignatureModalOpen(false);
            } catch(err) {
                 alert(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        }
    };
    
    // ... (ส่วนของ handleProfilePictureChange, handleConfirmCrop และ Render Logic เหมือนเดิม) ...
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleConfirmCrop = () => {
        if (cropperRef.current?.cropper && currentUser) {
            const croppedImageData = cropperRef.current.cropper.getCroppedCanvas({ width: 256, height: 256 }).toDataURL('image/png');
            setProfileImage(croppedImageData);
            localStorage.setItem(`${currentUser.email}_profile_image`, croppedImageData);
            setCropModalOpen(false);
            setImageToCrop(null);
        }
    };
    
    if (loading) return <div className={styles.loadingText}>กำลังโหลด...</div>;
    if (error) return <div className={styles.errorText}>เกิดข้อผิดพลาด: {error}</div>;
    if (!currentUser) return <div className={styles.loadingText}>ไม่พบข้อมูลผู้ใช้</div>;
    const fullname = `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim();

    return (
        <>
            <main className={styles.profileContainer}>
                {/* ... (ส่วน JSX ที่ใช้แสดงผลทั้งหมดเหมือนเดิม) ... */}
                <h1><FontAwesomeIcon icon={faUserCircle} /> โปรไฟล์ของฉัน</h1>
                <div className={styles.profileLayout}>
                    {/* --- Left Column --- */}
                    <div className={styles.mainProfileColumn}>
                        <section className={styles.profileCard}>
                            <div className={styles.profileHeader}>
                                <div className={styles.profilePictureWrapper}>
                                    <img src={profileImage} alt="รูปโปรไฟล์" />
                                    <label htmlFor="profile-picture-input" className={styles.editPictureBtn}>
                                        <FontAwesomeIcon icon={faCamera} />
                                    </label>
                                    <input type="file" id="profile-picture-input" style={{display: 'none'}} accept="image/*" onChange={handleProfilePictureChange}/>
                                </div>
                                <div className={styles.profileNameGroup}>
                                    <h2>{fullname}</h2>
                                    <p>รหัสนักศึกษา: {currentUser.student_id || '-'}</p>
                                </div>
                            </div>
                            <div className={styles.profileDetails}>
                                <h3>ข้อมูลส่วนตัว</h3>
                                <div className={styles.detailsGrid}>
                                    <div><label>ระดับการศึกษา:</label><span>{currentUser.degree || '-'}</span></div>
                                    <div><label>แผนการเรียน:</label><span>{currentUser.plan || '-'}</span></div>
                                    <div><label>หลักสูตร/สาขา:</label><span>{currentUser.program_name || '-'}</span></div>
                                    <div><label>ภาควิชา:</label><span>{currentUser.department_name || '-'}</span></div>
                                    <div><label>คณะ:</label><span>{currentUser.faculty || '-'}</span></div>
                                    <div><label>สถานะ:</label><span className={getStatusClass(currentUser.status_name)}>{currentUser.status_name || '-'}</span></div>
                                    <div>
                                        <label>เบอร์โทรศัพท์:</label>
                                        <div className={styles.editableField}>
                                            {isEditingPhone ? (
                                                <>
                                                    <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                                    <button onClick={handleSavePhone} className={styles.btnIcon} title="บันทึก"><FontAwesomeIcon icon={faSave} /></button>
                                                    <button onClick={() => setIsEditingPhone(false)} className={styles.btnIcon} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{currentUser.phone || '-'}</span>
                                                    <button onClick={() => setIsEditingPhone(true)} className={styles.btnIcon} title="แก้ไข"><FontAwesomeIcon icon={faPencilAlt} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div><label>อีเมล:</label><span>{currentUser.email || '-'}</span></div>
                                </div>
                            </div>
                        </section>

                         {/* ✅✅✅ เรียกใช้ Component ที่สร้างขึ้นมาตรงนี้ ✅✅✅ */}
                        <AccountManagementSection currentUser={currentUser} setCurrentUser={setCurrentUser} />

                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faSignature} /> ลายเซ็นดิจิทัล</h3>
                                <div className={styles.signatureDisplayArea}>
                                    {signatureImage ? <img src={signatureImage} alt="ลายเซ็น" /> : <p>ยังไม่มีลายเซ็น</p>}
                                </div>
                                <div className={styles.signatureActions}>
                                    <button className={styles.btn} onClick={() => setSignatureModalOpen(true)}><FontAwesomeIcon icon={faEdit} /> แก้ไขลายเซ็น</button>
                                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDeleteSignature} disabled={!signatureImage}><FontAwesomeIcon icon={faTrash} /> ลบลายเซ็น</button>
                                </div>
                        </section>
                    </div>

                    {/* --- Right Column --- */}
                    <div className={styles.sideProfileColumn}>
                        {/* ✅ 1. การ์ดข้อมูลวิทยานิพนธ์และอาจารย์ที่ปรึกษา */}
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faGraduationCap} /> ข้อมูลวิทยานิพนธ์</h3>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>รายละเอียดวิทยานิพนธ์</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ชื่อ (ไทย):</label><span>{currentUser.thesis_title_th || '-'}</span></li>
                                    <li><label>ชื่อ (อังกฤษ):</label><span>{currentUser.thesis_title_en || '-'}</span></li>
                                </ul>
                            </div>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>อาจารย์ที่ปรึกษา</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>อาจารย์ที่ปรึกษาหลัก:</label><span>{processedData.mainAdvisorName || '-'}</span></li>
                                    <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label><span>{processedData.coAdvisor1Name || '-'}</span></li>
                                    <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label><span>{processedData.coAdvisor2Name || '-'}</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* ✅✅✅ โค้ดส่วนที่แก้ไขทั้งหมด ✅✅✅ */}
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faClipboardCheck} /> สรุปผลการดำเนินการ</h3>

                            {/* --- 1. การสอบหัวข้อและเค้าโครง --- */}
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>การสอบหัวข้อและเค้าโครง</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>วันที่สอบหัวข้อ:</label><span>{formatThaiDate(currentUser.proposal_defense_date)}</span></li>
                                    <li><label>สถานะการสอบ:</label><span className={getStatusClass(currentUser.proposal_status)}>{currentUser.proposal_status || 'ยังไม่ยื่น'}</span></li>
                                    <li><label>วันที่อนุมัติหัวข้อ:</label><span>{formatThaiDate(currentUser.proposal_approval_date)}</span></li>
                                </ul>
                            </div>

                            {/* --- 2. การสอบวิทยานิพนธ์ขั้นสุดท้าย --- */}
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>การสอบวิทยานิพนธ์ขั้นสุดท้าย</h4>
                                <ul className={styles.statusListDetailed}>
                                        <li><label>วันที่สอบขั้นสุดท้าย:</label><span>{formatThaiDate(currentUser.final_defense_date)}</span></li>
                                        <li><label>สถานะการสอบ:</label><span className={getStatusClass(currentUser.final_defense_status)}>{currentUser.final_defense_status || 'ยังไม่ยื่น'}</span></li>
                                        <li><label>วันที่สำเร็จการศึกษา:</label><span>{formatThaiDate(currentUser.graduation_date)}</span></li>
                                </ul>
                            </div>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>ผลการสอบภาษาอังกฤษ ป.โท</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ประเภทการสอบ:</label><span>{processedData.approvedEngMasterDoc?.form_details?.exam_type || '-'}</span></li>
                                    <li><label>วันที่อนุมัติผลสอบ:</label><span>{formatThaiDate(processedData.approvedEngMasterDoc?.submission_date)}</span></li>
                                    <li><label>สถานะ:</label><span className={getStatusClass(processedData.approvedEngMasterDoc?.status_name)}>{processedData.approvedEngMasterDoc?.status_name || 'ยังไม่ยื่น'}</span></li>
                                </ul>
                            </div>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>ผลการสอบภาษาอังกฤษ ป.เอก</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>ประเภทการสอบ:</label><span>{processedData.approvedEngPhdDoc?.form_details?.exam_type || '-'}</span></li>
                                    <li><label>วันที่อนุมัติผลสอบ:</label><span>{formatThaiDate(processedData.approvedEngPhdDoc?.submission_date)}</span></li>
                                    <li><label>สถานะ:</label><span className={getStatusClass(processedData.approvedEngPhdDoc?.status_name)}>{processedData.approvedEngPhdDoc?.status_name || 'ยังไม่ยื่น'}</span></li>
                                </ul>
                            </div>
                            <div className={styles.statusGroup}>
                                <h4 className={styles.groupTitle}>ผลการสอบวัดคุณสมบัติ</h4>
                                <ul className={styles.statusListDetailed}>
                                    <li><label>วันที่อนุมัติผลสอบ:</label><span>{formatThaiDate(processedData.approvedQEDoc?.submission_date)}</span></li>
                                    <li><label>สถานะ:</label><span className={getStatusClass(processedData.approvedQEDoc?.status_name)}>{processedData.approvedQEDoc?.status_name || 'ยังไม่ยื่น'}</span></li>
                                </ul>
                            </div>
                        </section>
                        <section className={styles.profileCard}>
                            <h3><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบในระบบ (ที่อนุมัติแล้ว)</h3>
                            <ul className={styles.fileList}>
                                {processedData.allApprovedFiles && processedData.allApprovedFiles.length > 0 ? (
                                    processedData.allApprovedFiles.map((file, index) => (
                                        <li key={index}>
                                            <label>{file.formTitle}</label>
                                            <a href="#" onClick={(e) => e.preventDefault()}>{file.name}</a>
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.loadingText}>ยังไม่มีเอกสารแนบที่อนุมัติแล้ว</li>
                                )}
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            {/* --- Modals --- */}
            {isCropModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalBox} ${styles.cropModalBox}`}>
                        <h3>ปรับขนาดรูปโปรไฟล์</h3>
                        <div className={styles.cropperContainer}>
                            <Cropper
                                ref={cropperRef}
                                src={imageToCrop}
                                style={{ height: 400, width: '100%' }}
                                aspectRatio={1}
                                viewMode={1}
                                guides={true}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setCropModalOpen(false)} className={`${styles.btn} ${styles.btnSecondary}`}>ยกเลิก</button>
                            <button onClick={handleConfirmCrop} className={`${styles.btn} ${styles.btnPrimary}`}>ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isSignatureModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalBox} ${styles.signatureModalBox}`}>
                        <h3>แก้ไขลายเซ็นดิจิทัล</h3>
                        <div className={styles.tabNav}>
                            <button className={`${styles.tabBtn} ${signatureTab === 'draw' ? styles.active : ''}`} onClick={() => setSignatureTab('draw')}>วาดลายเซ็น</button>
                            <button className={`${styles.tabBtn} ${signatureTab === 'upload' ? styles.active : ''}`} onClick={() => setSignatureTab('upload')}>อัปโหลด</button>
                        </div>
                        <div className={styles.tabContent}>
                            {signatureTab === 'draw' && (
                                <div className={styles.canvasWrapper}>
                                    <SignaturePad 
                                        ref={signaturePadRef}
                                        options={{ penColor: 'black', backgroundColor: 'rgb(255,255,255)'}}
                                        canvasProps={{ className: styles.signatureCanvas }} 
                                    />
                                </div>
                            )}
                            {signatureTab === 'upload' && (
                                <div className={styles.uploadPlaceholder}>
                                    <label htmlFor="signature-upload-input" className={styles.btn}>
                                        <FontAwesomeIcon icon={faCamera} /> เลือกไฟล์รูปภาพ
                                    </label>
                                    <input type="file" id="signature-upload-input" ref={signatureFileInputRef} accept="image/*" style={{display: 'none'}} />
                                </div>
                            )}
                        </div>
                        <div className={styles.modalActionsStacked}>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setSignatureModalOpen(false)}>ยกเลิก</button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveSignature}>บันทึก</button>
                            </div>
                            <div className={styles.secondaryActions}>
                                <button className={styles.btnText} onClick={() => {
                                    if (signatureTab === 'draw' && signaturePadRef.current) {
                                        signaturePadRef.current.clear();
                                    } else if (signatureFileInputRef.current) {
                                        signatureFileInputRef.current.value = null;
                                    }
                                }}>ล้าง</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;
