import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Form4Page.module.css'; // ตรวจสอบว่า path ของ CSS ถูกต้อง

function Form4Page() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    
    // States สำหรับข้อมูลที่ดึงมาแสดง
    const [displayData, setDisplayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States สำหรับข้อมูลที่กรอกในฟอร์ม
    const [formData, setFormData] = useState({
        documentTypes: {},
        evaluators: [],
        comment: '',
    });
    const [numEvaluators, setNumEvaluators] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const API_URL = 'http://localhost:3000';

    // ดึงข้อมูลเริ่มต้นสำหรับฟอร์ม
    useEffect(() => {
        if (!user) return;
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/forms/form4-data/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลสำหรับฟอร์มได้');
                const data = await response.json();
                setDisplayData(data.studentInfo);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [user, token]);

    // ตั้งค่า evaluators เริ่มต้น
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            evaluators: Array.from({ length: numEvaluators }, () => ({
                prefix: '', firstName: '', lastName: '', affiliation: '', phone: '', email: ''
            }))
        }));
    }, [numEvaluators]);

    // --- ฟังก์ชันสำหรับจัดการการกรอกฟอร์ม (Event Handlers) ---
    const handleNumEvaluatorsChange = (e) => {
        let count = parseInt(e.target.value, 10);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 10) count = 10;
        setNumEvaluators(count);
    };

    const handleEvaluatorChange = (index, field, value) => {
        const newEvaluators = [...formData.evaluators];
        newEvaluators[index][field] = value;
        setFormData(prev => ({ ...prev, evaluators: newEvaluators }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const newDocTypes = { ...formData.documentTypes };
        if (checked) {
            newDocTypes[value] = { checked: true, quantity: 1, otherText: '' };
        } else {
            delete newDocTypes[value];
        }
        setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
    };

    const handleQuantityChange = (type, quantity) => {
        const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);
        const newDocTypes = { ...formData.documentTypes };
        if (newDocTypes[type]) {
            newDocTypes[type].quantity = numQuantity;
            setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
        }
    };

    const handleOtherTextChange = (text) => {
        const newDocTypes = { ...formData.documentTypes };
        if (newDocTypes['อื่นๆ']) {
            newDocTypes['อื่นๆ'].otherText = text;
            setFormData(prev => ({ ...prev, documentTypes: newDocTypes }));
        }
    };

    const handleCommentChange = (e) => {
        setFormData(prev => ({...prev, comment: e.target.value}));
    };

    // --- ฟังก์ชันสำหรับยื่นฟอร์ม ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('ไม่พบข้อมูลผู้ใช้');
        
        // --- Validation ---
        const documentTypesData = Object.entries(formData.documentTypes).map(([type, data]) => {
            if (type === 'อื่นๆ' && !data.otherText.trim()) return null;
            return { type: (type === 'อื่นๆ' ? `อื่นๆ: ${data.otherText.trim()}` : type), quantity: data.quantity };
        }).filter(Boolean);

        if (documentTypesData.length === 0) {
            return alert("กรุณาเลือกประเภทของเครื่องมือที่ต้องการประเมินอย่างน้อย 1 รายการ");
        }
        
        for (let i = 0; i < formData.evaluators.length; i++) {
            const ev = formData.evaluators[i];
            if (!ev.prefix || !ev.firstName || !ev.lastName || !ev.affiliation || !ev.phone || !ev.email) {
                return alert(`กรุณากรอกข้อมูลผู้ทรงคุณวุฒิคนที่ ${i + 1} ให้ครบถ้วน`);
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                student_user_id: user.id,
                student_comment: formData.comment,
                form_details: {
                    details: {
                        document_types: documentTypesData,
                        evaluators: formData.evaluators
                    }
                }
            };

            const response = await fetch(`${API_URL}/api/submissions/form4`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการยื่นฟอร์ม');
            
            alert('✅ ยื่นฟอร์ม 4 สำเร็จ!');
            navigate('/student/status');

        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) return <div>กำลังโหลด...</div>;
    if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className={styles.formContainer}>
            <h2>📑 แบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>📌 ข้อมูลนักศึกษา</legend>
                    <div className={`${styles.infoGrid} ${styles.threeCols}`}>
                        <div><label>ชื่อ-นามสกุล:</label><input type="text" value={displayData?.fullname || ''} disabled /></div>
                        <div><label>รหัสนักศึกษา:</label><input type="text" value={displayData?.student_id || ''} disabled /></div>
                        <div><label>ระดับปริญญา:</label><input type="text" value={displayData?.degree || ''} disabled /></div>
                    </div>
                    <div className={styles.infoGrid}>
                        <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={displayData?.program_name || ''} disabled /></div>
                        <div><label>ภาควิชา:</label><input type="text" value={displayData?.department_name || ''} disabled /></div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>📖 ข้อมูลวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</legend>
                    <div className={styles.formGroup}>
                        <label>วันที่เสนอเค้าโครงฯ ได้รับอนุมัติ:</label>
                        <input type="text" value={displayData?.proposal_approval_date ? new Date(displayData.proposal_approval_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาไทย):</label>
                        <textarea value={displayData?.thesis_title_th || '-'} rows="2" disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาอังกฤษ):</label>
                        <textarea value={displayData?.thesis_title_en || '-'} rows="2" disabled />
                    </div>
                </fieldset>

                <fieldset>
                    <legend>👨‍🏫 รายละเอียดการขอเชิญ</legend>
                    <div className={styles.formGroup}>
                        <label>ประเภทของเครื่องมือที่ต้องการประเมิน* (เลือกและระบุจำนวน)</label>
                        <div className={styles.checkboxGroup}>
                            {['บทเรียน', 'แบบประเมิน', 'แบบทดสอบ', 'แบบสอบถาม'].map(type => (
                                <div className={styles.checkboxItem} key={type}>
                                    <label>
                                        <input type="checkbox" name="document-type" value={type}
                                            checked={!!formData.documentTypes[type]?.checked}
                                            onChange={handleCheckboxChange} /> {type}
                                    </label>
                                    <div className={styles.quantityWrapper}>
                                        <input 
                                            type="number" 
                                            className={styles.quantityInput}
                                            min="1" 
                                            value={formData.documentTypes[type]?.quantity || 1}
                                            disabled={!formData.documentTypes[type]?.checked}
                                            onChange={(e) => handleQuantityChange(type, e.target.value)}
                                        />
                                        <span>ฉบับ</span>
                                    </div>
                                </div>
                            ))}
                            <div className={`${styles.checkboxItem} ${styles.otherItem}`}>
                                <label>
                                    <input type="checkbox" name="document-type" value="อื่นๆ"
                                        checked={!!formData.documentTypes['อื่นๆ']?.checked}
                                        onChange={handleCheckboxChange} /> อื่นๆ:
                                </label>
                                <input 
                                    type="text"
                                    placeholder="ระบุเพิ่มเติม"
                                    disabled={!formData.documentTypes['อื่นๆ']?.checked}
                                    value={formData.documentTypes['อื่นๆ']?.otherText || ''}
                                    onChange={(e) => handleOtherTextChange(e.target.value)}
                                />
                                <div className={styles.quantityWrapper}>
                                    <input 
                                        type="number" 
                                        className={styles.quantityInput}
                                        min="1" 
                                        value={formData.documentTypes['อื่นๆ']?.quantity || 1}
                                        disabled={!formData.documentTypes['อื่นๆ']?.checked}
                                        onChange={(e) => handleQuantityChange('อื่นๆ', e.target.value)}
                                    />
                                    <span>ฉบับ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="num-evaluators">จำนวนผู้ทรงคุณวุฒิที่ต้องการเชิญ (1-10 คน)*</label>
                        <input type="number" id="num-evaluators" value={numEvaluators} onChange={handleNumEvaluatorsChange} min="1" max="10" placeholder="ระบุจำนวน" required />
                    </div>
                    <div id="evaluators-container">
                        {formData.evaluators.map((evaluator, index) => (
                            <div key={index} className={styles.evaluatorCard}>
                                <h4>ข้อมูลผู้ทรงคุณวุฒิ คนที่ {index + 1}</h4>
                                <div className={styles.formGroup}>
                                    <label>คำนำหน้า/ยศ/ตำแหน่ง*</label>
                                    <input type="text" value={evaluator.prefix} onChange={(e) => handleEvaluatorChange(index, 'prefix', e.target.value)} required />
                                </div>
                                <div className={styles.infoGrid}>
                                    <div>
                                        <label>ชื่อ*</label>
                                        <input type="text" value={evaluator.firstName} onChange={(e) => handleEvaluatorChange(index, 'firstName', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label>นามสกุล*</label>
                                        <input type="text" value={evaluator.lastName} onChange={(e) => handleEvaluatorChange(index, 'lastName', e.target.value)} required />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>สถาบัน/หน่วยงาน*</label>
                                    <input type="text" value={evaluator.affiliation} onChange={(e) => handleEvaluatorChange(index, 'affiliation', e.target.value)} required />
                                </div>
                                <div className={styles.infoGrid}>
                                    <div>
                                        <label>เบอร์โทรศัพท์*</label>
                                        <input type="tel" value={evaluator.phone} onChange={(e) => handleEvaluatorChange(index, 'phone', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label>อีเมล*</label>
                                        <input type="email" value={evaluator.email} onChange={(e) => handleEvaluatorChange(index, 'email', e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>
                <fieldset>
                    <legend>📝 ความคิดเห็นเพิ่มเติม (ถ้ามี)</legend>
                    <div className={styles.formGroup}>
                        <label htmlFor="student-comment">คุณสามารถใส่คำแนะนำหรือข้อมูลเพิ่มเติมถึงเจ้าหน้าที่ได้ที่นี่</label>
                        <textarea id="student-comment" name="comment" rows="4" maxLength="250" placeholder="ความคิดเห็นเพิ่มเติม..." value={formData.comment} onChange={handleCommentChange}></textarea>
                        <div className={styles.charCounter}>{formData.comment.length} / 250</div>
                    </div>
                </fieldset>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังส่ง...' : '📤 ยืนยันและส่งแบบฟอร์ม'}
                </button>
            </form>
        </div>
    );
}

export default Form4Page;