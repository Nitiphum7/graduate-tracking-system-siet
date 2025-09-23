import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExamSubmitPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- ฟังก์ชัน Helper ---
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// --- Component ย่อยสำหรับแสดงข้อมูลนักศึกษา ---
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

    const handleScoreChange = (e) => setScores(prev => ({ ...prev, [e.target.id]: e.target.value }));
    const handleFileChange = (e) => setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    const handleRemoveFile = (indexToRemove) => setFiles(prev => prev.filter((_, index) => index !== indexToRemove));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!examType || !examDate || files.length === 0 || (examType === 'OTHER' && !otherExamType.trim())) {
            alert("กรุณากรอกข้อมูลและแนบไฟล์ผลสอบให้ครบถ้วน");
            return;
        }
        setIsSubmitting(true);
        try {
            const fileData = await Promise.all(files.map(async (file) => ({ name: file.name, url: await fileToBase64(file) })));
            const finalExamType = examType === 'OTHER' ? otherExamType.trim() : examType;
            
            // ✅✅✅ แก้ไข Logic การเลือก ID เอกสารตรงนี้ ✅✅✅
            const docTypeIdForEnglish = degree === 'ปริญญาเอก' ? 7 : 8; // ป.เอกใช้ ID 7, ป.โทใช้ ID 8

            const payload = {
                student_user_id: studentInfo.id,
                document_type_id: docTypeIdForEnglish, // ใช้ ID ที่เลือกแบบไดนามิก
                student_comment: comment,
                form_details: { exam_type: finalExamType, exam_date: examDate, scores, files: fileData, degree }
            };
            
            const response = await fetch('http://localhost:3000/api/submissions/exam-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            alert("✅ ยื่นผลสอบภาษาอังกฤษเรียบร้อยแล้ว!");
            navigate('/student/status');
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ส่วน renderScoreInputs และ JSX ที่เหลือเหมือนเดิม
    const renderScoreInputs = () => { /* ... โค้ดเดิม ... */ };
    return (
        <form onSubmit={handleSubmit} className={styles.fadeIn}>
            {/* ... JSX ทั้งหมดของฟอร์ม ... */}
            <StudentInfoDisplay studentData={studentInfo} />
            <fieldset>
                <legend>📝 กรอกข้อมูลผลสอบ</legend>
                <div className={styles.formGroup}>
                    <label htmlFor="exam-type">ประเภทการสอบ*</label>
                    <select id="exam-type" value={examType} onChange={(e) => setExamType(e.target.value)} required>
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
            <fieldset>
                <legend>📝 ความคิดเห็นเพิ่มเติม</legend>
                <textarea rows="4" placeholder="ความคิดเห็นเพิ่มเติม..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </fieldset>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};

// --- Component ย่อยสำหรับฟอร์มยื่นผลสอบ QE (เหมือนเดิม) ---
const QEForm = ({ studentInfo }) => {
    // ... โค้ดเดิมทั้งหมดของ QEForm ...
    const navigate = useNavigate();
    const [qeScore, setQeScore] = useState('');
    const [qeFile, setQeFile] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => { if (e.target.files.length > 0) setQeFile(e.target.files[0]); };
    const handleRemoveFile = () => {
        setQeFile(null);
        document.getElementById('qe-file-input').value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qeScore || !qeFile) {
            alert("กรุณาเลือกผลการสอบและแนบไฟล์หลักฐาน");
            return;
        }
        setIsSubmitting(true);
        try {
            const fileData = { name: qeFile.name, url: await fileToBase64(qeFile) };
            
            const payload = {
                student_user_id: studentInfo.id,
                student_comment: comment,
                form_details: { result: qeScore, file: fileData }
            };

            const response = await fetch('http://localhost:3000/api/submissions/qe-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            alert('✅ ส่งผลสอบวัดคุณสมบัติ (QE) สำเร็จ!');
            navigate('/student/status');
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
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
            <fieldset>
                <legend>📝 ความคิดเห็นเพิ่มเติม</legend>
                <textarea rows="4" placeholder="ความคิดเห็นเพิ่มเติม..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </fieldset>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                   {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งผลสอบ'}
            </button>
        </form>
    );
};

// --- Component หลักของหน้า (เหมือนเดิม) ---
function ExamSubmitPage() {
    // ... โค้ดเดิมทั้งหมดของ ExamSubmitPage ...
    const [submissionType, setSubmissionType] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        const loadStudentInfo = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found, user is not logged in.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to verify user token.');
                }

                const currentUser = await response.json();
                
                setStudentInfo({
                    id: currentUser.id,
                    fullname: `${currentUser.prefix_th || ''} ${currentUser.first_name_th || ''} ${currentUser.last_name_th || ''}`.trim(),
                    student_id: currentUser.student_id,
                    degree: currentUser.degree,
                    programName: currentUser.program_name,
                });

            } catch (error) {
                console.error("Failed to load student data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStudentInfo();
    }, []);

    const renderForm = () => {
        if (loading) return <div>กำลังโหลดข้อมูลนักศึกษา...</div>;
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