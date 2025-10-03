import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Form3Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
// 💡 แก้ไข: Import API Call Functions แทน API_URL, getAuthHeaders
import { getForm3Data, submitForm3 } from '../../utils/api'; 

// Helper function to convert file to Base64 Data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function Form3Page() {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  // ❌ ลบการประกาศ API_URL ซ้ำซ้อนออก
  // const API_URL = 'http://localhost:3000'; 

  const [displayData, setDisplayData] = useState(null);
  const [formData, setFormData] = useState({
    outlineFile: null,
    comment: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        if (authLoading) return;
        if (!currentUser) {
            navigate('/login');
            return;
        }

    const loadPageData = async () => {
      try {
        // 💡 แก้ไข: ใช้ getForm3Data จาก api.js (ซึ่งใช้ Axios)
        const response = await getForm3Data(currentUser.id);
        const data = response.data; // Axios จะส่งข้อมูลอยู่ใน field .data

        setDisplayData(data);
        // 💡 เพิ่ม Logic การตรวจสอบ: หาก Form 2 ยังไม่ถูกอนุมัติ ให้อ่าน Error ชัดเจนขึ้น
        if (!data.isForm2Approved) {
          setError("⚠️ ไม่สามารถยื่นฟอร์ม 3 ได้: ฟอร์ม 2 (ขออนุมัติหัวข้อ) ยังไม่ได้รับการอนุมัติ");
        }

      } catch (err) {
        // จัดการ Axios Error
        const errorMessage = err.response?.data?.message || err.message || "ไม่สามารถดึงข้อมูลสำหรับฟอร์ม 3 ได้";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [currentUser, authLoading, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };
  
  const handleRemoveFile = (fileName) => {
    setFormData(prev => ({ ...prev, [fileName]: null }));
    // ต้องไม่รีเซ็ต value ของ input[type=file] โดยตรงใน React
    // แต่เนื่องจากเราใช้ Controlled Component (state) อยู่แล้ว การตั้งค่าเป็น null ใน state ก็เพียงพอ
    // การใช้ document.getElementById().value = "" อาจทำให้เกิดปัญหาได้ ควรหลีกเลี่ยง
    console.log(`File input for ${fileName} cleared in state.`); 
  };

  // ✅✅✅ นี่คือ handleSubmit ที่แก้ไขให้ใช้ Axios แล้ว ✅✅✅
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.outlineFile) {
      alert("กรุณาแนบไฟล์เค้าโครงวิทยานิพนธ์");
      return;
    }
    if (!displayData?.isForm2Approved) {
      alert("ไม่สามารถยื่นฟอร์ม 3 ได้ เนื่องจากฟอร์ม 2 ของคุณยังไม่ได้รับการอนุมัติ");
      return;
    }
    if (!displayData?.programChairId) {
      alert("ข้อมูลประธานกรรมการสอบไม่สมบูรณ์ ไม่สามารถดำเนินการต่อได้");
      return;
    }


    try {
        setLoading(true);
        const fileUrl = await fileToDataUrl(formData.outlineFile);

        const submissionData = {
          student_user_id: currentUser.id,
          files: [{ 
            type: 'เค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์', 
            name: formData.outlineFile.name,
            url: fileUrl // ส่งไฟล์ในรูปแบบ Data URL
          }],
          student_comment: formData.comment,
          // ส่ง ID ของประธานหลักสูตรที่ได้มาจาก Form 2 กลับไป
          approvers: {
            program_chair_id: displayData.programChairId,
          }
        };

        // 💡 แก้ไข: ใช้ submitForm3 จาก api.js
        await submitForm3(submissionData);
        
        alert("✅ ยืนยันและนำส่งเอกสารเรียบร้อยแล้ว!");
        navigate("/student/status");

    } catch (error) {
        console.error("Form 3 submission error:", error);
        // ดึง Error message จาก Axios response
        const errorMessage = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการส่งฟอร์ม";
        alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  };

  if (loading || authLoading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม</h2>
      <form onSubmit={handleSubmit}>
        {/* ... JSX ส่วนที่เหลือเหมือนเดิม ... */}
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={styles.infoGrid}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
            <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData?.programName || ''} disabled /></div>
            <div className={styles.fullWidth}><label>ภาควิชา:</label><input type="text" value={displayData?.departmentName || ''} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📖 ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
          <div className={styles.formGroup}>
            <label>วันที่อนุมัติหัวข้อ:</label>
            <input 
              type="text" 
              value={displayData?.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : "ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)"} 
              disabled 
            />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาไทย):</label>
            <textarea value={displayData?.thesis_title_th || ''} rows="2" disabled />
          </div>
          <div className={styles.formGroup}>
            <label>ชื่อเรื่อง (ภาษาอังกฤษ):</label>
            <textarea value={displayData?.thesis_title_en || ''} rows="2" disabled />
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍🏫 อาจารย์ผู้รับผิดชอบ</legend>
          <div className={styles.formGroup}>
            <label htmlFor="programChair">ประธานกรรมการสอบ (จากฟอร์ม 2)</label>
            <input 
              type="text" 
              id="programChair" 
              value={displayData?.programChairName || ''} 
              disabled 
            />
          </div>
          <div className={`${styles.infoGrid} ${styles.threeCols}`}>
            <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={displayData?.mainAdvisorName || ''} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={displayData?.coAdvisor1Name || ''} disabled /></div>
            <div><label>อาจารย์ที่ปรึกษาร่วม 2:</label><input type="text" value={displayData?.coAdvisor2Name || ''} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📎 แนบไฟล์เค้าโครงวิทยานิพนธ์</legend>
          <div className={`${styles.subSection} ${formData.outlineFile ? styles.attached : ''}`}>
            <label htmlFor="outlineFile">ไฟล์เค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์*</label>
            <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F3_PROPOSAL_REVISED_DDMMYYYY.pdf</small>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="outlineFile" className={styles.fileInputLabel}>
                {formData.outlineFile ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
              </label>
              <input type="file" id="outlineFile" name="outlineFile" onChange={handleFileChange} required={!formData.outlineFile} accept=".pdf,.doc,.docx" />
              {formData.outlineFile ? (
                <div className={styles.fileInfo}>
                  <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                  <span className={styles.fileNameDisplay}>
                    {formData.outlineFile.name}
                  </span>
                  <button type="button" onClick={() => handleRemoveFile('outlineFile')} className={styles.removeFileBtn}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
          <div className={styles.formGroup}>
            <label htmlFor="comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
            <textarea 
              id="comment" 
              name="comment"
              rows="4" 
              maxLength="250" 
              placeholder="ความคิดเห็นเพิ่มเติม... (ไม่เกิน 250 ตัวอักษร)"
              value={formData.comment}
              onChange={handleChange}
            />
            <div className={styles.charCounter}>{formData.comment.length} / 250</div>
          </div>
        </fieldset>
        
        <button type="submit" disabled={!displayData?.isForm2Approved}>📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form3Page;