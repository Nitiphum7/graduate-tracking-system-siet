import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Form5Page.module.css';
// 💡 แก้ไข: Import API Call Functions แทน API_URL, getAuthHeaders
import { getForm5Data, submitForm5 } from '../../utils/api'; 

const initialToolState = {
    'แบบสอบถาม': { checked: false, quantity: 1 },
    'แบบทดสอบ': { checked: false, quantity: 1 },
    'ทดลองสอน': { checked: false, quantity: 1 },
    'อื่นๆ': { checked: false, quantity: 1, otherText: '' },
};

function Form5Page() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [displayData, setDisplayData] = useState(null);
    const [researchTools, setResearchTools] = useState(initialToolState);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // --- 1. ดึงข้อมูลเริ่มต้นจาก Backend API ---
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                // 💡 แก้ไข: ใช้ getForm5Data จาก api.js (ซึ่งใช้ Axios)
                const response = await getForm5Data(user.id);
                const data = response.data;

                setDisplayData(data.studentInfo);
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

    // --- 2. Handlers สำหรับจัดการฟอร์ม (เหมือนเดิม) ---
    const handleToolChange = (e) => {
        const { value, checked } = e.target;
        setResearchTools(prev => ({
            ...prev,
            [value]: { ...prev[value], checked: checked }
        }));
    };
    const handleQuantityChange = (toolName, quantity) => {
        const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);
        setResearchTools(prev => ({
            ...prev,
            [toolName]: { ...prev[toolName], quantity: numQuantity }
        }));
    };
    const handleOtherTextChange = (e) => {
        const { value } = e.target;
        setResearchTools(prev => ({
            ...prev,
            'อื่นๆ': { ...prev['อื่นๆ'], otherText: value }
        }));
    };

    // --- 3. handleSubmit ที่ส่งข้อมูลไป Backend API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("ไม่พบข้อมูลผู้ใช้");

    const researchToolsData = Object.entries(researchTools)
        .filter(([_, data]) => data.checked)
        .map(([type, data]) => {
            let finalType = type;
            if (type === 'อื่นๆ') {
                if (!data.otherText.trim()) return null;
                finalType = `อื่นๆ: ${data.otherText.trim()}`;
            }
            return { type: finalType, quantity: data.quantity };
        }).filter(Boolean);

    if (researchToolsData.length === 0) {
        return alert("กรุณาเลือกเครื่องมือที่ใช้ในการวิจัยอย่างน้อย 1 รายการ");
    }
    
    setIsSubmitting(true);
    try {
        // ✅✅✅ แก้ไขโครงสร้าง Payload ตรงนี้ ✅✅✅
        const payload = {
            student_user_id: user.id,
            student_comment: comment,
            form_details: {
                research_tools: researchToolsData
            }
        };

        // 💡 แก้ไข: ใช้ submitForm5 จาก api.js (ซึ่งใช้ Axios)
        await submitForm5(payload);

        alert("✅ ยืนยันและส่งแบบฟอร์ม 5 เรียบร้อยแล้ว!");
        navigate("/student/status");

    } catch (err) {
        // จัดการ Axios Error
        console.error("Form 5 submission error:", err);
        const errorMessage = err.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการยื่นฟอร์ม";
        alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
    } finally {
        setIsSubmitting(false);
    }
};

    if (loading || authLoading) return <div>กำลังโหลดข้อมูล...</div>;
    // 💡 ปรับปรุงการแสดง Error/Data Not Found
    if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;
    if (!displayData) return <div className={styles.loading}>ไม่พบข้อมูลนักศึกษา โปรดตรวจสอบฟอร์ม 2</div>;

    return (
        <div className={styles.formContainer}>
            <h2>📑 แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>📌 ข้อมูลนักศึกษา</legend>
                    <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                        <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData.fullname || ''} disabled /></div>
                        <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData.student_id || ''} disabled /></div>
                        <div><label>ระดับปริญญา:</label><input type="text" value={displayData.degree || ''} disabled /></div>
                        <div className={styles.fullWidth}><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData.program_name || ''} disabled /></div>
                        <div><label>อีเมล:</label><input type="email" value={displayData.email || ''} disabled /></div>
                        <div><label>เบอร์โทรศัพท์:</label><input type="text" value={displayData.phone || ''} disabled /></div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>📖 ข้อมูลวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
                    <div className={styles.formGroup}>
                        <label>วันที่อนุมัติหัวข้อ:</label>
                        <input type="text" value={displayData.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ยังไม่มีข้อมูล (รอฟอร์ม 2 อนุมัติ)'} disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาไทย):</label>
                        <textarea value={displayData.thesis_title_th || ''} rows="2" disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาอังกฤษ):</label>
                        <textarea value={displayData.thesis_title_en || ''} rows="2" disabled />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>📋 รายละเอียดการขออนุญาต</legend>
                    <div className={styles.formGroup}>
                        <label>เครื่องมือที่ใช้ในการวิจัย* (เลือกและระบุจำนวน)</label>
                        <div className={styles.checkboxGroup}>
                            {Object.keys(initialToolState).map(toolName => (
                                <div key={toolName} className={`${styles.checkboxItem} ${toolName === 'อื่นๆ' ? styles.otherItem : ''}`}>
                                    <label>
                                        <input type="checkbox" name="research-tool" value={toolName} 
                                            checked={researchTools[toolName].checked}
                                            onChange={handleToolChange}
                                        /> 
                                        {toolName === 'อื่นๆ' ? 'อื่นๆ:' : toolName}
                                    </label>
                                    {toolName === 'อื่นๆ' && (
                                        <input type="text" placeholder="ระบุเพิ่มเติม"
                                            disabled={!researchTools['อื่นๆ'].checked}
                                            value={researchTools['อื่นๆ'].otherText}
                                            onChange={handleOtherTextChange}
                                        />
                                    )}
                                    <div className={styles.quantityWrapper}>
                                        <input type="number" className={styles.quantityInput} min="1"
                                            disabled={!researchTools[toolName].checked}
                                            value={researchTools[toolName].quantity}
                                            onChange={(e) => handleQuantityChange(toolName, e.target.value)}
                                        />
                                        <span>ฉบับ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </fieldset>
              
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งแบบฟอร์ม'}
                </button>
            </form>
        </div>
    );
}

export default Form5Page;