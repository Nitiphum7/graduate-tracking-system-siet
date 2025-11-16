import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExamSubmitPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
// 💡 แก้ไข: Import API Call Functions แทน API_URL, getAuthHeaders
import { submitExamResult, submitQEResult } from '../../utils/api'; 
import { useAuth } from '../../hooks/useAuth';

// --- ฟังก์ชัน Helper ---
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// --- Component ย่อยสำหรับแสดงข้อมูลนักศึกษา (ไม่มีการแก้ไข) ---
const StudentInfoDisplay = ({ studentData }) => {
    if (!studentData) return null;
    return (
        <fieldset>
            <legend>📌 ข้อมูลนักศึกษา</legend>
            <div className={styles.infoGrid}>
                <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentData.fullname} disabled /></div>
                <div><label>รหัสนักศึกษา:</label><input type="text" value={studentData.student_id} disabled /></div>
                    <div><label>ระดับการศึกษา:</label><input type="text" value={studentData.degree} disabled /></div>
                <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentData.programName} disabled /></div>
            </div>
        </fieldset>
    );
};

// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบภาษาอังกฤษ ---
const EnglishTestForm = ({ studentInfo, degree }) => {
    const navigate = useNavigate();
    const [examType, setExamType] = useState('');
    const [otherExamType, setOtherExamType] = useState('');
    const [examDate, setExamDate] = useState('');
    const [scores, setScores] = useState({});
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🎯 FIX: ปรับปรุง handleScoreChange ให้กรองค่าว่าง
    const handleScoreChange = (e) => {
        const { id, value } = e.target;
        setScores(prev => {
            const newScores = { ...prev };
            if (value === '' || value === null || value === undefined) {
                delete newScores[id]; // ลบคีย์ถ้าค่าว่าง
            } else {
                newScores[id] = value;
            }
            return newScores;
        });
    };
    const handleFileChange = (e) => setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
}, []);

    // ✅✅✅ แก้ไข handleSubmit ให้ใช้ Axios Function ✅✅✅
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🎯 FIX: บังคับเช็คการกรอกคะแนน ถ้ามีการเลือกประเภทการสอบแล้ว
        if (examType && Object.keys(scores).length === 0) {
            alert(`กรุณากรอกคะแนนผลสอบ ${examType} อย่างน้อย 1 ช่อง`);
            return;
        }

        if (!examType || !examDate || files.length === 0 || (examType === 'OTHER' && !otherExamType.trim())) {
            alert("กรุณากรอกข้อมูลและแนบไฟล์ผลสอบให้ครบถ้วน");
            return;
        }
        setIsSubmitting(true);
        try {
            const fileData = await Promise.all(files.map(async (file) => ({ name: file.name, url: await fileToBase64(file) })));
            const finalExamType = examType === 'OTHER' ? otherExamType.trim() : examType;
            
            // ✅✅✅ แก้ไข Logic การเลือก ID เอกสารตรงนี้ ✅✅✅
            const docTypeIdForEnglish = degree === 'ปริญญาเอก' ? 7 : 8;  // ป.เอกใช้ ID 8, ป.โทใช้ ID 7 (อ้างอิงจาก server.js: case 7/8)

            const payload = {
                student_user_id: studentInfo.id,
                document_type_id: docTypeIdForEnglish, 
                student_comment: comment,
                form_details: { 
                    exam_type: finalExamType, 
                    exam_date: examDate,      
                    ...scores, // รวมคะแนนที่ถูกกรอก (ถ้ามี)
                    files: fileData          
                }
            };
            
            // 💡 เรียกใช้ submitExamResult (Axios function)
            await submitExamResult(payload);
            
            alert("✅ ยื่นผลสอบภาษาอังกฤษเรียบร้อยแล้ว!");
            navigate('/student/status');
        } catch (error) {
            // จัดการ Axios Error
            console.error("English Test submission error:", error);
            const errorMessage = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการส่งผลสอบ";
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // 🎯 FIX: เพิ่มฟังก์ชัน renderScoreInputs (ไม่มีการแก้ไข Logic)
    const renderScoreInputs = () => {
        let scoreFields = [];
        
        switch (examType) {
            case 'TOEFL':
                scoreFields = [
                    { id: 'reading_score', label: 'คะแนน Reading' },
                    { id: 'listening_score', label: 'คะแนน Listening' },
                    { id: 'total_score', label: 'คะแนนรวม' }
                ];
                break;
            case 'IELTS':
                scoreFields = [
                    { id: 'reading_band', label: 'Reading Band' },
                    { id: 'listening_band', label: 'Listening Band' },
                    { id: 'overall_band', label: 'Overall Band' }
                ];
                break;
            case 'OTHER':
            case 'CU-TEP':
            case 'TU-GET':
            case 'KMITL-TEP':
                scoreFields = [
                    { id: 'total_score', label: 'คะแนนรวม' },
                    { id: 'status', label: 'ผลลัพธ์ (เช่น ผ่าน/ไม่ผ่าน)' }
                ];
                break;
            default:
                return <p>กรุณาเลือกประเภทการสอบเพื่อแสดงช่องคะแนน</p>;
        }

        return (
            <div className={styles.scoreGrid}>
                {scoreFields.map(field => (
                    <div className={styles.formGroup} key={field.id}>
                        <label htmlFor={field.id}>{field.label}*</label>
                        <input
                            type="text"
                            id={field.id}
                            value={scores[field.id] || ''}
                            onChange={handleScoreChange}
                            required={field.label.includes('*')}
                            placeholder={`กรอก${field.label}`}
                        />
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
            {/* ... JSX ทั้งหมดของฟอร์ม ... */}
            <StudentInfoDisplay studentData={studentInfo} />
            <fieldset>
                <legend>📝 กรอกข้อมูลผลสอบ</legend>
                <div className={styles.formGroup}>
                    <label htmlFor="exam-type">ประเภทการสอบ*</label>
                    <select id="exam-type" value={examType} onChange={(e) => { setExamType(e.target.value); setScores({}); }} required>
                        <option value="">-- เลือกประเภทการสอบ --</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="IELTS">IELTS</option>
                        <option value="CU-TEP">CU-TEP</option>
                        <option value="TU-GET">TU-GET</option>
                        <option value="KMITL-TEP">KMITL-TEP</option>
                        <option value="OTHER">อื่นๆ</option>
                    </select>
                </div>
                {examType === 'OTHER' && (
                    <div className={styles.formGroup}>
                        <label htmlFor="other-exam-type">ชื่อการสอบอื่นๆ*</label>
                        <input type="text" id="other-exam-type" value={otherExamType} onChange={(e) => setOtherExamType(e.target.value)} required placeholder="ระบุชื่อการสอบ" />
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label htmlFor="exam-date">วันที่สอบ*</label>
                    <input type="date" id="exam-date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                    {renderScoreInputs()}
                </div>
            </fieldset>
            
            <fieldset>
                <legend>📎 แนบไฟล์หลักฐานผลสอบ</legend>
                <div className={styles.uploadArea}>
                    <label htmlFor="exam-file-input" className={styles.uploadBtn}>
                        <FontAwesomeIcon icon={faCloudUploadAlt} /> เลือกไฟล์...
                    </label>
                    <input type="file" id="exam-file-input" onChange={handleFileChange} multiple style={{display: 'none'}} accept=".pdf,.jpg,.jpeg,.png" />
                </div>
                <ul className={styles.fileListContainer}>
                    {files.map((file, index) => (
                        <li key={index}>
                            <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                                <span>{file.name}</span>
                            </a>
                            <button type="button" onClick={() => handleRemoveFile(index)} className={styles.deleteFileBtn}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </li>
                    ))}
                </ul>
            </fieldset>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};

// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบ QE ---
const QEForm = ({ studentInfo }) => {
    const navigate = useNavigate();
    const [qeScore, setQeScore] = useState('');
    const [qeFile, setQeFile] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => { if (e.target.files.length > 0) setQeFile(e.target.files[0]); };
    const handleRemoveFile = () => {
        setQeFile(null);
        const inputElement = document.getElementById('qe-file-input');
        if (inputElement) inputElement.value = "";
    };

    // ✅✅✅ แก้ไข handleSubmit ให้ใช้ Axios Function ✅✅✅
    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qeScore || !qeFile) {
        alert("กรุณาเลือกผลการสอบและแนบไฟล์หลักฐาน");
        return;
    }
    setIsSubmitting(true);
    try {
        const fileData = { name: qeFile.name, url: await fileToBase64(qeFile) };
        const docTypeIdForQE = 9;
        const payload = {
            student_user_id: studentInfo.id,
            document_type_id: docTypeIdForQE, // 🎯 แก้ไข: กำหนด Document Type ID ให้ชัดเจน
            student_comment: comment,
            form_details: { 
                result: qeScore, 
                files: [fileData] 
            }
        };

        // 💡 เรียกใช้ submitQEResult (Axios function)
        await submitQEResult(payload);
        
        alert('✅ ส่งผลสอบวัดคุณสมบัติ (QE) สำเร็จ!');
        navigate('/student/status');
        } catch (error) {
            // จัดการ Axios Error
            console.error("QE submission error:", error);
            const errorMessage = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการส่งผลสอบ";
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
            <StudentInfoDisplay studentData={studentInfo} />
            <fieldset>
                <legend>📝 กรอกข้อมูลผลสอบวัดคุณสมบัติ (QE)</legend>
                <div className={styles.formGroup}>
                    <label htmlFor="qe-score">ผลการสอบ*</label>
                    <select id="qe-score" value={qeScore} onChange={(e) => setQeScore(e.target.value)} required>
                        <option value="">-- เลือกผลการสอบ --</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                    </select>
                </div>
            </fieldset>
            <fieldset>
                <legend>📎 แนบไฟล์หลักฐานผลสอบ</legend>
                <div className={styles.uploadArea}>
                        <label htmlFor="qe-file-input" className={styles.uploadBtn}>
                            <FontAwesomeIcon icon={faCloudUploadAlt} /> เลือกไฟล์...
                        </label>
                        <input type="file" id="qe-file-input" onChange={handleFileChange} style={{display: 'none'}} accept=".pdf,.jpg,.jpeg,.png" />
                </div>
                <ul className={styles.fileListContainer}>
                        {qeFile && (
                            <li>
                                <a href={URL.createObjectURL(qeFile)} target="_blank" rel="noopener noreferrer" className={styles.fileInfo}>
                                    <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                                    <span>{qeFile.name}</span>
                                </a>
                                <button type="button" onClick={handleRemoveFile} className={styles.deleteFileBtn}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </li>
                        )}
                </ul>
            </fieldset>
        
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};

function ExamSubmitPage() {
    // ✅ 1. เรียกใช้ useAuth เพื่อดึงข้อมูล user และสถานะ loading
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [submissionType, setSubmissionType] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);

    
    // ✅ 2. แก้ไข useEffect ให้สั้นและมีประสิทธิภาพขึ้น
    useEffect(() => {
        // ถ้าระบบยังตรวจสอบสิทธิ์ไม่เสร็จ ให้รอ
        if (authLoading) {
            return;
        }
        // ถ้าตรวจสอบแล้วไม่พบผู้ใช้ ให้ไปหน้า login
        if (!user) {
            navigate('/login');
            return;
        }

        // ถ้ามีข้อมูล user, ให้นำมาจัดรูปแบบสำหรับแสดงผลได้เลย
        setStudentInfo({
            id: user.id,
            fullname: `${user.prefix_th || ''} ${user.first_name_th || ''} ${user.last_name_th || ''}`.trim(),
            student_id: user.student_id,
            degree: user.degree,
            programName: user.program_name,
        });

    }, [user, authLoading, navigate]); // ให้ Effect นี้ทำงานเมื่อ user หรือ authLoading เปลี่ยนไป

    const renderForm = () => {
        // ✅ 3. แก้ไขเงื่อนไข Loading ให้ใช้ authLoading
        if (authLoading) return <div>กำลังโหลดข้อมูลผู้ใช้...</div>;
        if (!studentInfo) return <div>ไม่พบข้อมูลนักศึกษา กรุณาเข้าสู่ระบบใหม่อีกครั้ง</div>;

        switch (submissionType) {
            case 'eng_master': return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาโท" />;
            case 'eng_phd': return <EnglishTestForm studentInfo={studentInfo} degree="ปริญญาเอก" />;
            case 'qe': return <QEForm studentInfo={studentInfo} />;
            default: return <div className={styles.formPlaceholder}>กรุณาเลือกประเภทการยื่นผลสอบ</div>;
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>ยื่นผลสอบ</h2>
            <div className={styles.selectionGroup}>
                <label htmlFor="submissionType">กรุณาเลือกประเภทการยื่นผลสอบ*</label>
                <select id="submissionType" value={submissionType} onChange={(e) => setSubmissionType(e.target.value)} required>
                    <option value="">-- เลือกประเภท --</option>
                    <option value="eng_master">ยื่นผลสอบภาษาอังกฤษ (ปริญญาโท)</option>
                    <option value="eng_phd">ยื่นผลสอบภาษาอังกฤษ (ปริญญาเอก)</option>
                    <option value="qe">ยื่นผลสอบวัดคุณสมบัติ (QE)</option>
                </select>
            </div>
            <div className={styles.dynamicFormContainer}>
                {renderForm()}
            </div>
        </div>
    );
}

export default ExamSubmitPage;