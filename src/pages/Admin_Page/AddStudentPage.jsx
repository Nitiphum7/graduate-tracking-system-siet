import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css'; // ใช้สไตล์ร่วมกัน
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCog, faUser, faArrowLeft, faSave, 
    faUserPlus, faEye, faEyeSlash, faSyncAlt, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';

// --- Helper Function for API Calls ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Initial State (ปรับแก้เล็กน้อยให้ใช้ ID) ---
const INITIAL_NEW_STUDENT = {
    student_id: '',
    prefix_th: 'นาย',
    first_name_th: '',
    last_name_th: '',
    prefix_en: 'Mr.',
    first_name_en: '',
    last_name_en: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    degree: 'ปริญญาโท',
    program_id: '', // ✅ เปลี่ยนเป็น program_id
    department_id: '', // ✅ เปลี่ยนเป็น department_id
    status_id: 1, // 1 = กำลังศึกษา
};

// --- Main Page Component ---
function AddStudentPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_NEW_STUDENT);
    
    // ✅ State สำหรับเก็บข้อมูลจาก API
    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [activeSection, setActiveSection] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    // ✅ CHANGED: Fetch ข้อมูลที่จำเป็นสำหรับ Dropdown จาก Server
    useEffect(() => {
        const fetchRequiredData = async () => {
            setLoading(true);
            try {
                const headers = getAuthHeaders();
                const [programsRes, deptsRes] = await Promise.all([
                    fetch('http://localhost:3000/api/programs', { headers }),
                    fetch('http://localhost:3000/api/departments', { headers })
                ]);

                if (!programsRes.ok || !deptsRes.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลหลักสูตรหรือภาควิชาได้');
                }
                
                const programsData = await programsRes.json();
                const deptsData = await deptsRes.json();
                
                setPrograms(programsData);
                setDepartments(deptsData);

            } catch (error) {
                console.error("Failed to fetch required data", error);
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRequiredData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // แปลงค่าที่เป็นตัวเลขสำหรับ ID
        const finalValue = (name.endsWith('_id')) ? (value ? parseInt(value, 10) : '') : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({...prev, password: password, confirm_password: password}));
    };

    // ✅ CHANGED: Logic การบันทึกข้อมูลผ่าน API
    const handleSave = async () => {
        // --- Validation (เหมือนเดิม) ---
        if (!formData.student_id || !formData.email || !formData.password || !formData.first_name_th || !formData.last_name_th) {
            alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน: รหัสนักศึกษา, ชื่อ-สกุล, อีเมล และรหัสผ่าน");
            setActiveSection('account'); // อาจจะไปที่ Info ถ้าชื่อยังไม่กรอก
            return;
        }
        if (formData.password !== formData.confirm_password) {
            alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            setActiveSection('account');
            return;
        }

        try {
            const finalStudentData = { ...formData };
            delete finalStudentData.confirm_password; // ไม่ต้องส่ง confirm_password ไปที่ API

            const response = await fetch('http://localhost:3000/api/students', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(finalStudentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการสร้างบัญชีนักศึกษา');
            }
            
            const result = await response.json();
            alert(result.message || `เพิ่มนักศึกษาใหม่ (${formData.first_name_th}) สำเร็จ!`);
            navigate('/admin/manage-users'); // กลับไปหน้าจัดการผู้ใช้

        } catch (error) {
            console.error("Failed to save student:", error);
            alert(error.message);
        }
    };

    if (loading) {
        return <div className={styles.pageContainer}>กำลังโหลดข้อมูล...</div>
    }

    return (
        <div className={styles.pageLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                 <div className={styles.studentProfileCard}>
                    <div className={styles.profileImageContainer}>
                        <div className={styles.noImagePlaceholder}><FontAwesomeIcon icon={faUserPlus} size="2x"/></div>
                    </div>
                    <div className={styles.studentName}>เพิ่มนักศึกษาใหม่</div>
                    <div className={styles.studentId}>กรุณากรอกข้อมูลให้ครบถ้วน</div>
                </div>
                <hr className={styles.divider} />
                <button className={`${styles.sidebarBtn} ${activeSection === 'account' ? styles.active : ''}`} onClick={() => setActiveSection('account')}>
                    <FontAwesomeIcon icon={faUserCog} /><span>การจัดการบัญชี</span>
                </button>
                <button className={`${styles.sidebarBtn} ${activeSection === 'info' ? styles.active : ''}`} onClick={() => setActiveSection('info')}>
                    <FontAwesomeIcon icon={faUser} /><span>ข้อมูลทั่วไป/การศึกษา</span>
                </button>
                <hr className={styles.divider} />
                <button className={styles.sidebarBtn} onClick={() => navigate('/admin/manage-users')}>
                    <FontAwesomeIcon icon={faArrowLeft} /><span>กลับหน้ารายชื่อ</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserGraduate} /> เพิ่มข้อมูลนักศึกษาใหม่</h1>
                    <button className={styles.saveButton} onClick={handleSave}>
                        <FontAwesomeIcon icon={faSave} /> สร้างบัญชีนักศึกษา
                    </button>
                </div>

                {/* Account Section */}
                {activeSection === 'account' && (
                    <div className={styles.card}>
                        <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
                        <div className={styles.cardBody}>
                            <div className={styles.formSection}>
                                <h4>กำหนดข้อมูลบัญชีเริ่มต้น</h4>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><label>อีเมล (สำหรับเข้าสู่ระบบ)</label><input type="email" name="email" placeholder="กรอกอีเมลสำหรับใช้เข้าสู่ระบบ" value={formData.email} onChange={handleInputChange} required /></div>
                                    <div className={styles.formGroup}><label>รหัสผ่าน</label><div className={styles.passwordInputWrapper}><input type={showPassword ? 'text' : 'password'} name="password" placeholder="กรอกรหัสผ่าน" value={formData.password} onChange={handleInputChange} required /><FontAwesomeIcon icon={faSyncAlt} className={styles.passwordIcon} onClick={generatePassword} title="สุ่มรหัสผ่านใหม่" /></div></div>
                                    <div className={styles.formGroup}><label>ยืนยันรหัสผ่าน</label><div className={styles.passwordInputWrapper}><input type={showPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} placeholder="กรอกรหัสผ่านอีกครั้ง" required /><FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className={styles.passwordIcon} style={{ right: '40px' }} onClick={() => setShowPassword(!showPassword)} /></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                {activeSection === 'info' && (
                    <>
                        <div className={styles.card}>
                            <h3>ข้อมูลทั่วไป</h3>
                            <div className={styles.cardBody}>
                                <div className={`${styles.formGrid} ${styles.fourCols}`}>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><label>รหัสนักศึกษา</label><input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} required /></div>
                                    <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" name="prefix_th" value={formData.prefix_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={formData.first_name_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={formData.last_name_th} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>คำนำหน้า (อังกฤษ)</label><select name="prefix_en" value={formData.prefix_en} onChange={handleInputChange}><option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option></select></div>
                                    <div className={styles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={formData.first_name_en} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={formData.last_name_en} onChange={handleInputChange} /></div>
                                    <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <h3>ข้อมูลการศึกษา</h3>
                            <div className={styles.cardBody}>
                                <div className={`${styles.formGrid} ${styles.fourCols}`}>
                                    <div className={styles.formGroup}><label>ระดับการศึกษา</label><select name="degree" value={formData.degree} onChange={handleInputChange}><option value="ปริญญาโท">ปริญญาโท</option><option value="ปริญญาเอก">ปริญญาเอก</option></select></div>
                                    <div className={styles.formGroup}><label>หลักสูตร</label><select name="program_id" value={formData.program_id} onChange={handleInputChange}><option value="">-- เลือกหลักสูตร --</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>ภาควิชา</label><select name="department_id" value={formData.department_id} onChange={handleInputChange}><option value="">-- เลือกภาควิชา --</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                                    <div className={styles.formGroup}><label>สถานะนักศึกษา</label><select name="status_id" value={formData.status_id} onChange={handleInputChange}><option value="1">กำลังศึกษา</option><option value="2">พ้นสภาพ</option><option value="3">สำเร็จการศึกษา</option></select></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default AddStudentPage;