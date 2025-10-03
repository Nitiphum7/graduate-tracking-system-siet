import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Form6Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
// 💡 แก้ไข: Import API Call Functions แทน API_URL, getAuthHeaders
import { getForm6Data, submitForm6 } from '../../utils/api'; 

// --- Helper Functions ---
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// --- Component ย่อยสำหรับ File Input (ไม่มีการแก้ไข) ---
const FileInputBox = ({ id, name, label, instruction, file, onChange, onRemove, required = true, accept = ".pdf,.jpg,.jpeg,.png" }) => {
    return (
        <div className={`${styles.subSection} ${file ? styles.attached : ''}`}>
            <label htmlFor={id} className={styles.subSectionLabel}>{label}</label>
            {instruction && <small className={styles.fileNamingInstruction}>{instruction}</small>}
            <div className={styles.fileInputWrapper}>
                <label htmlFor={id} className={styles.fileInputLabel}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} /> {file ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                </label>
                <input type="file" id={id} name={name} onChange={onChange} style={{ display: 'none' }} required={required && !file} accept={accept} />
                {file ? (
                    <div className={styles.fileInfo}>
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                        <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className={styles.fileNameDisplay}>
                            {file.name}
                        </a>
                        <button type="button" onClick={() => onRemove(name)} className={styles.removeFileBtn}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ) : (
                    <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
                )}
            </div>
        </div>
    );
};

// --- Component หลักของหน้าฟอร์ม 6 ---
function Form6Page() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [displayData, setDisplayData] = useState(null);
    const [advisorLists, setAdvisorLists] = useState({ potentialChairs: [], internalMembers: [], externalMembers: [] });
    const [formData, setFormData] = useState({
        committeeChair: '', coAdvisor2: '', committeeMember5: '',
        reserveExternal: '', reserveInternal: '', comment: '',
        files: {
            thesisDraftFile: null, abstractThFile: null, abstractEnFile: null,
            tocThFile: null, tocEnFile: null, publicationProofFile: null, gradeCheckProofFile: null
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // 💡 แก้ไข: ใช้ getForm6Data จาก api.js (ซึ่งใช้ Axios)
                const response = await getForm6Data(user.id);
                const data = response.data;

                setDisplayData(data.studentInfo);
                setAdvisorLists(data.advisorLists);

                // ตั้งค่าคณะกรรมการเริ่มต้นจาก Form 2 ที่อนุมัติแล้ว
                const committeeFromForm2 = data.studentInfo.committee_from_form2 || {};
                setFormData(prev => ({
                    ...prev,
                    committeeChair: committeeFromForm2.chair_id || '',
                    coAdvisor2: committeeFromForm2.co_advisor2_id || '',
                    committeeMember5: committeeFromForm2.member5_id || '',
                    reserveExternal: committeeFromForm2.reserve_external_id || '',
                    reserveInternal: committeeFromForm2.reserve_internal_id || '',
                }));
            } catch (err) {
                // จัดการ Axios Error
                const errorMessage = err.response?.data?.message || err.message || "ไม่สามารถดึงข้อมูลสำหรับฟอร์มได้";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, files: { ...prev.files, [name]: files[0] } }));
        }
    };

    const handleRemoveFile = (fileName) => {
        setFormData(prev => ({ ...prev, files: { ...prev.files, [fileName]: null } }));
        // 💡 ล้างค่าใน input field เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
        const inputElement = document.getElementById(fileName);
        if (inputElement) inputElement.value = "";
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const requiredFiles = ['thesisDraftFile', 'abstractThFile', 'abstractEnFile', 'tocThFile', 'tocEnFile', 'publicationProofFile', 'gradeCheckProofFile'];
        if (requiredFiles.some(fileName => !formData.files[fileName])) {
            return alert("กรุณาแนบไฟล์ประกอบคำร้องขอสอบให้ครบถ้วนทุกช่อง");
        }
        // ตรวจสอบว่ามีการเลือกคณะกรรมการครบถ้วนหรือไม่ (เฉพาะช่องที่จำเป็น)
        if (!formData.committeeChair || !formData.coAdvisor2 || !formData.committeeMember5 || !formData.reserveExternal || !formData.reserveInternal) {
            return alert("กรุณาเลือกคณะกรรมการสอบและกรรมการสำรองให้ครบถ้วน");
        }
        
        setIsSubmitting(true);
        try {
            // 1. แปลงไฟล์ทั้งหมดเป็น Base64 Data URL
            const uploadedFiles = {};
            for (const key of requiredFiles) {
                uploadedFiles[key] = {
                    name: formData.files[key].name,
                    url: await fileToBase64(formData.files[key])
                };
            }
            // 2. สร้าง Payload
            const payload = {
                student_user_id: user.id,
                student_comment: formData.comment,
                form_details: {
                    committee: {
                        chair_id: formData.committeeChair,
                        co_advisor2_id: formData.coAdvisor2,
                        member5_id: formData.committeeMember5,
                        reserve_external_id: formData.reserveExternal,
                        reserve_internal_id: formData.reserveInternal,
                    },
                    files: uploadedFiles,
                }
            };
            
            // 💡 แก้ไข: ใช้ submitForm6 จาก api.js (ซึ่งใช้ Axios)
            await submitForm6(payload);
            
            alert("✅ ยืนยันและส่งคำร้องขอสอบ (ฟอร์ม 6) เรียบร้อยแล้ว!");
            navigate('/student/status');

        } catch (err) {
            // จัดการ Axios Error
            console.error("Form 6 submission error:", err);
            const errorMessage = err.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการยื่นฟอร์ม";
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || authLoading) return <div>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;
    if (!displayData) return <div>ไม่พบข้อมูลนักศึกษา</div>;

    return (
        <div className={styles.formContainer}>
            <h2>📑 บันทึกข้อความ: ขอแต่งตั้งคณะกรรมการการสอบวิทยานิพนธ์ขั้นสุดท้าย</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>📌 ข้อมูลผู้ยื่นคำร้อง</legend>
                    <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                        <div><label>คำนำหน้า-ชื่อ-นามสกุล:</label><input type="text" value={displayData.fullname || ''} disabled /></div>
                        <div><label>รหัสประจำตัว:</label><input type="text" value={displayData.student_id || ''} disabled /></div>
                        <div><label>ระดับปริญญา:</label><input type="text" value={displayData.degree || ''} disabled /></div>
                    </div>
                    <div className={styles.infoGrid}>
                        <div><label>หลักสูตร/สาขาวิชา:</label><input type="text" value={displayData.program_name || ''} disabled /></div>
                        <div><label>ภาควิชา:</label><input type="text" value={displayData.department_name || ''} disabled /></div>
                    </div>
                    {/* ... (สามารถเพิ่ม field อื่นๆ จาก displayData ได้ตามต้องการ) ... */}
                </fieldset>

                <fieldset>
                    <legend>👨‍🏫 คณะกรรมการสอบและอาจารย์ที่ปรึกษา</legend>
                    <p className={styles.fieldsetDescription}>ข้อมูลคณะกรรมการจะถูกดึงมาจากฟอร์ม 2 ที่อนุมัติแล้วโดยอัตโนมัติ และคุณสามารถแก้ไขรายชื่อได้ (ยกเว้นอาจารย์ที่ปรึกษา)</p>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>คณะกรรมการสอบ (สามารถแก้ไขได้)*</label>
                        <div className={styles.formGroup}>
                            <label htmlFor="committeeChair">ประธานกรรมการสอบ*</label>
                            <select id="committeeChair" name="committeeChair" value={formData.committeeChair} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.potentialChairs.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        {/* 💡 เพิ่ม Dropdown ที่เหลือ (ต้องมีในโค้ดต้นฉบับเพื่อให้ฟอร์มสมบูรณ์) */}
                        <div className={styles.formGroup}>
                            <label htmlFor="coAdvisor2">กรรมการ (ที่ปรึกษาร่วม 2)*</label>
                            <select id="coAdvisor2" name="coAdvisor2" value={formData.coAdvisor2} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="committeeMember5">กรรมการสอบ (คนที่ 5)*</label>
                            <select id="committeeMember5" name="committeeMember5" value={formData.committeeMember5} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="reserveExternal">กรรมการสำรอง (ภายนอก)*</label>
                            <select id="reserveExternal" name="reserveExternal" value={formData.reserveExternal} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.externalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="reserveInternal">กรรมการสำรอง (ภายใน)*</label>
                            <select id="reserveInternal" name="reserveInternal" value={formData.reserveInternal} onChange={handleChange} required>
                                <option value="">-- กรุณาเลือก --</option>
                                {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>📎 แนบเอกสารประกอบคำร้องขอสอบ</legend>
                    <p className={styles.fieldsetDescription}>กรุณาอัปโหลดไฟล์เอกสารที่จำเป็นทั้งหมดให้ครบถ้วน</p>
                    <FileInputBox id="thesisDraftFile" name="thesisDraftFile" label="1. วิทยานิพนธ์ฉบับสมบูรณ์*" instruction="*ตั้งชื่อไฟล์: รหัสนักศึกษา_F6_THESIS_FINAL.pdf" file={formData.files.thesisDraftFile} onChange={handleFileChange} onRemove={handleRemoveFile} accept=".pdf"/>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>2. บทคัดย่อ (Abstract)*</label>
                        <div className={styles.fileGroup}>
                            <FileInputBox id="abstractThFile" name="abstractThFile" label="ไฟล์ภาษาไทย (.pdf)" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_ABSTRACT_TH.pdf" file={formData.files.abstractThFile} onChange={handleFileChange} onRemove={handleRemoveFile} accept=".pdf" required={true}/>
                            <FileInputBox id="abstractEnFile" name="abstractEnFile" label="ไฟล์ภาษาอังกฤษ (.pdf)" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_ABSTRACT_EN.pdf" file={formData.files.abstractEnFile} onChange={handleFileChange} onRemove={handleRemoveFile} accept=".pdf" required={true}/>
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <label className={styles.subSectionLabel}>3. สารบัญ, สารบัญตาราง, สารบัญภาพ*</label>
                        <div className={styles.fileGroup}>
                            <FileInputBox id="tocThFile" name="tocThFile" label="ไฟล์ภาษาไทย (.pdf)" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_TOC_TH.pdf" file={formData.files.tocThFile} onChange={handleFileChange} onRemove={handleRemoveFile} accept=".pdf" required={true}/>
                            <FileInputBox id="tocEnFile" name="tocEnFile" label="ไฟล์ภาษาอังกฤษ (.pdf)" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_TOC_EN.pdf" file={formData.files.tocEnFile} onChange={handleFileChange} onRemove={handleRemoveFile} accept=".pdf" required={true}/>
                        </div>
                    </div>
                    <FileInputBox id="publicationProofFile" name="publicationProofFile" label="4. หลักฐานการตอบรับการตีพิมพ์/นำเสนอผลงาน*" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_PUBLISH_PROOF.pdf/jpg/png" file={formData.files.publicationProofFile} onChange={handleFileChange} onRemove={handleRemoveFile} required={true}/>
                    <FileInputBox id="gradeCheckProofFile" name="gradeCheckProofFile" label="5. หลักฐานการตรวจสอบผลการเรียน*" instruction="*ชื่อไฟล์: รหัสนักศึกษา_F6_GRADE_PROOF.pdf/jpg/png" file={formData.files.gradeCheckProofFile} onChange={handleFileChange} onRemove={handleRemoveFile} required={true}/>
                </fieldset>
                
                <fieldset>
                    <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
                    <div className={styles.formGroup}>
                        <label htmlFor="comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
                        <textarea id="comment" name="comment" rows="4" maxLength="250" placeholder="ความคิดเห็นเพิ่มเติม..." value={formData.comment} onChange={handleChange}></textarea>
                        <div className={styles.charCounter}>{formData.comment.length} / 250</div>
                    </div>
                </fieldset>
                
                <div className={styles.submitContainer}>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งคำร้องขอสอบ'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Form6Page;