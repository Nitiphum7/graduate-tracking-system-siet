import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form1Page.module.css';
import { getForm1Data, submitForm1 } from '../../utils/api'; 
import { useAuth } from '../../hooks/useAuth';

function Form1Page() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    
    const [studentInfo, setStudentInfo] = useState(null);
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainAdvisor, setMainAdvisor] = useState('');
    const [coAdvisor, setCoAdvisor] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const loadFormData = async () => {
            setLoading(true);
            try {
                const response = await getForm1Data(user.id);
                const data = response.data;

                setStudentInfo({
                    ...data.studentInfo,
                    fullname: `${data.studentInfo.prefix_th || ''} ${data.studentInfo.first_name_th || ''} ${data.studentInfo.last_name_th || ''}`.trim(),
                    program: data.studentInfo.program_name,
                    department: data.studentInfo.department_name,
                });
                setAdvisors(data.advisors);
            } catch (err) {
                setError(err.message || "ไม่สามารถดึงข้อมูลจาก Server ได้");
            } finally {
                setLoading(false);
            }
        };
        loadFormData();
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!mainAdvisor) {
            alert("กรุณาเลือกอาจารย์ที่ปรึกษาหลัก");
            return;
        }
        if (!user.has_signed) {
            alert("ไม่พบข้อมูลลายเซ็น กรุณาตั้งค่าลายเซ็นก่อน");
            navigate('/signature');
            return;
        }

        const submissionData = {
            main_advisor_id: mainAdvisor,
            co_advisor_id: coAdvisor || null,
            student_comment: comment,
        };

        try {
            await submitForm1(submissionData);
            alert("✅ ยืนยันและส่งแบบฟอร์มเรียบร้อยแล้ว!");
            navigate("/student/status");
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการส่งฟอร์ม';
            alert(`❌ เกิดข้อผิดพลาด: ${errorMessage}`);
        }
    };

    if (loading || authLoading) return <div className={styles.loading}>กำลังโหลดข้อมูลฟอร์ม...</div>;
    if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;
    if (!studentInfo) return <div className={styles.loading}>ไม่พบข้อมูลนักศึกษา...</div>;

    const coAdvisorOptions = advisors.filter(adv => adv.advisor_id && adv.advisor_id !== mainAdvisor);

    return (
        <div className={styles.formContainer}>
            <h2>📑 แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</h2>
            <form onSubmit={handleSubmit}>
                
                {/* --- 📌 ข้อมูลนักศึกษา --- */}
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

                {/* --- 👨‍🏫 เลือกอาจารย์ที่ปรึกษา --- */}
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

                {/* --- 📝 ความคิดเห็นเพิ่มเติม --- */}
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