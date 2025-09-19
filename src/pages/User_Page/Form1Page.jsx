import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form1Page.module.css';

function Form1Page() {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  // --- State สำหรับข้อมูล ---
  const [studentInfo, setStudentInfo] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State สำหรับค่าในฟอร์ม ---
  const [mainAdvisor, setMainAdvisor] = useState('');
  const [coAdvisor, setCoAdvisor] = useState('');
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // --- Effect สำหรับดึงข้อมูลเมื่อเปิดหน้า ---
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // 1. ดึงข้อมูลผู้ใช้ที่ล็อกอินจาก Local Storage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
          throw new Error("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
        }
        setCurrentUser(storedUser);

        // 2. เรียก API เพื่อดึงข้อมูลนักศึกษาและรายชื่ออาจารย์
        const response = await fetch(`${API_URL}/api/form1/data/${storedUser.id}`);
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลจาก Server ได้");
        }
        const data = await response.json();

        // 3. ตั้งค่า State ด้วยข้อมูลที่ได้รับ
        setStudentInfo({
          ...data.studentInfo,
          fullname: `${data.studentInfo.prefix_th || ''} ${data.studentInfo.first_name_th || ''} ${data.studentInfo.last_name_th || ''}`.trim(),
          program: data.studentInfo.program_name,
          department: data.studentInfo.department_name,
        });
        setAdvisors(data.advisors);

      } catch (err) {
        setError(err.message);
        if (err.message.includes("ล็อกอิน")) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, [navigate]);

  // --- Logic การ Submit ฟอร์ม ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mainAdvisor) {
      alert("กรุณาเลือกอาจารย์ที่ปรึกษาหลัก");
      return;
    }
    if (!currentUser.has_signed) {
        alert("ไม่พบข้อมูลลายเซ็น กรุณาตั้งค่าลายเซ็นก่อน");
        navigate('/signature');
        return;
    }

    const formPrefix = "Form1"; // หรือ "Form3", "Form4" ตามแต่ละฟอร์ม
    const timestamp = Date.now(); // ดึงตัวเลขเวลาปัจจุบัน
    const newDocId = `${formPrefix}-${timestamp}`; // ✅ สร้าง ID ที่ไม่ซ้ำกัน
    const submissionData = {
        student_user_id: currentUser.id,
        main_advisor_id: mainAdvisor,
        co_advisor_id: coAdvisor || null,
        student_comment: comment,
    };

    try {
        // 2. ส่งข้อมูลไปยัง API
        const response = await fetch(`${API_URL}/api/submissions/form1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการส่งฟอร์ม');
        }

        // 3. เมื่อสำเร็จ แจ้งเตือนและนำทางไปหน้าสถานะ
        alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
        navigate("/student/status");

    } catch (err) {
        alert(`❌ เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  // --- ส่วนแสดงผล ---
  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูลฟอร์ม...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const coAdvisorOptions = advisors.filter(adv => adv.advisor_id && adv.advisor_id !== mainAdvisor);

  return (
    <div className={styles.formContainer}>
      <h2>📑 แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={styles.infoGrid}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentInfo.fullname} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={studentInfo.student_id} disabled /></div>
            <div><label>ระดับการศึกษา:</label><input type="text" value={studentInfo.degree} disabled /></div>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentInfo.program} disabled /></div>
            <div><label>ภาควิชา:</label><input type="text" value={studentInfo.department} disabled /></div>
            <div><label>คณะ:</label><input type="text" value={studentInfo.faculty} disabled /></div>
            <div><label>แผนการเรียน:</label><input type="text" value={studentInfo.plan} disabled /></div>
            <div><label>เบอร์โทรศัพท์:</label><input type="text" value={studentInfo.phone} disabled /></div>
            <div className={styles.fullWidth}><label>อีเมล:</label><input type="email" value={studentInfo.email} disabled /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍🏫 เลือกอาจารย์ที่ปรึกษา</legend>
          <div className={styles.formGroup}>
            <label htmlFor="main-advisor">อาจารย์ที่ปรึกษาหลัก*:</label>
            <select id="main-advisor" required value={mainAdvisor} onChange={(e) => setMainAdvisor(e.target.value)}>
              <option value="">-- กรุณาเลือกอาจารย์ที่ปรึกษาหลัก --</option>
              {advisors.map(adv => (
                <option key={adv.advisor_id} value={adv.advisor_id}>
                  {`${adv.prefix_th || ''}${adv.first_name_th || ''} ${adv.last_name_th || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="co-advisor">อาจารย์ที่ปรึกษาร่วม (ถ้ามี):</label>
            <select id="co-advisor" value={coAdvisor} onChange={(e) => setCoAdvisor(e.target.value)}>
              <option value="">-- สามารถเลือกอาจารย์ที่ปรึกษาร่วม --</option>
              {coAdvisorOptions.map(adv => (
                <option key={adv.advisor_id} value={adv.advisor_id}>
                  {`${adv.prefix_th || ''}${adv.first_name_th || ''} ${adv.last_name_th || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
          <div className={styles.formGroup}>
            <label htmlFor="student-comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
            <textarea 
              id="student-comment" 
              rows="4" 
              maxLength="250" 
              placeholder="ความคิดเห็นเพิ่มเติม... (ไม่เกิน 250 ตัวอักษร)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={styles.charCounter}>{comment.length} / 250</div>
          </div>
        </fieldset>
        
        <button type="submit">📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form1Page;