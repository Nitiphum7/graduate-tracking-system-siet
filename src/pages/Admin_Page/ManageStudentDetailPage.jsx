import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ManageStudentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserCog, faUser, faBook, faUsers, faFileAlt, 
    faHistory, faArrowLeft, faSave, faUserGraduate, 
    faEye, faEyeSlash, faSyncAlt, faPlus, faUserPlus, faCheck, faTimes,
    faPencilAlt, faTrashAlt, faClipboardCheck,faUserTie
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// --- Helper function for API calls ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("Authentication token not found.");
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Initial State for a new student ---
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
    phone: '',
    degree: 'ปริญญาโท',
    program_id: null,
    department_id: null,
    status_id: 1, // Default to "กำลังศึกษา"
    // Add other fields from your form if needed, initialized to empty/default values
    publications: [],
    related_files: [],
};


// --- 1. Sidebar Component ---
const SidebarManageStudent = ({ student, activeSection, setActiveSection, onBack, isNew }) => {
    if (!student) return <aside className={styles.sidebar}>Loading...</aside>;
    
    const menuItems = isNew ? [
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/การศึกษา' },
    ] : [
        { id: 'account', icon: faUserCog, text: 'การจัดการบัญชี' },
        { id: 'info', icon: faUser, text: 'ข้อมูลทั่วไป/การศึกษา' },
        { id: 'thesis', icon: faBook, text: 'ข้อมูลวิทยานิพนธ์' },
        { id: 'committee', icon: faUsers, text: 'คณะกรรมการสอบ' },
        { id: 'publications', icon: faFileAlt, text: 'ผลงานตีพิมพ์และเอกสาร' },
        { id: 'history', icon: faHistory, text: 'ประวัติการยื่นเอกสาร' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.studentProfileCard}>
                <div className={styles.profileImageContainer}>
                    <div className={styles.noImagePlaceholder}>{isNew ? <FontAwesomeIcon icon={faUserPlus} size="2x"/> : <FontAwesomeIcon icon={faUserGraduate} size="2x"/>}</div>
                </div>
                <div className={styles.studentName}>
                    {isNew ? "เพิ่มนักศึกษาใหม่" : `${student.prefix_th || ''}${student.first_name_th || ''} ${student.last_name_th || ''}`}
                </div>
                <div className={styles.studentId}>
                    {isNew ? "กรุณากรอกข้อมูลให้ครบถ้วน" : `รหัสนักศึกษา: ${student.student_id}`}
                </div>
                <div className={styles.studentEmail}>{isNew ? "" : student.email}</div>
            </div>
            <hr className={styles.divider} />
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.active : ''}`}
                    onClick={() => setActiveSection(item.id)}
                >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.text}</span>
                </button>
            ))}
            <hr className={styles.divider} />
            <button className={styles.sidebarBtn} onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>กลับหน้ารายชื่อ</span>
            </button>
        </aside>
    );
};

// --- 2. Section Components ---
const AccountSection = ({ student, handleInputChange, isNew }) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleInputChange({ target: { name: 'password', value: password } });
        handleInputChange({ target: { name: 'confirm_password', value: password } });
    };

    return (
        <div className={styles.card}>
            <h3><FontAwesomeIcon icon={faUserCog} /> การจัดการบัญชี</h3>
            <div className={styles.cardBody}>
                {!isNew && (
                    <div className={styles.formSection}>
                        <h4>ข้อมูลปัจจุบัน</h4>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}><label>อีเมล (สำหรับเข้าสู่ระบบ)</label><input type="email" value={student.email || ''} disabled /></div>
                            <div className={styles.formGroup}><label>รหัสผ่านปัจจุบัน</label><input type="password" value="••••••••" readOnly className={styles.readOnlyInput}/></div>
                        </div>
                    </div>
                )}
                <div className={styles.formSection}>
                    <h4>{isNew ? 'กำหนดข้อมูลบัญชีเริ่มต้น' : 'แก้ไขข้อมูลบัญชี'}</h4>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><label>อีเมล (สำหรับเข้าสู่ระบบ)</label><input type="email" name="email" placeholder={isNew ? "กรอกอีเมลสำหรับใช้เข้าสู่ระบบ" : "กรอกอีเมลใหม่ (ถ้าต้องการเปลี่ยน)"} value={student.email || ''} onChange={handleInputChange} required /></div>
                        <div className={styles.formGroup}>
                            <label>{isNew ? 'รหัสผ่าน' : 'รหัสผ่านใหม่'}</label>
                            <div className={styles.passwordInputWrapper}>
                                <input type={showPassword ? 'text' : 'password'} name="password" placeholder={isNew ? "กรอกรหัสผ่าน" : "เว้นว่างไว้หากไม่ต้องการเปลี่ยน"} value={student.password || ''} onChange={handleInputChange} required={isNew} />
                                <FontAwesomeIcon icon={faSyncAlt} className={styles.passwordIcon} onClick={generatePassword} title="สุ่มรหัสผ่านใหม่" />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{isNew ? 'ยืนยันรหัสผ่าน' : 'ยืนยันรหัสผ่านใหม่'}</label>
                            <div className={styles.passwordInputWrapper}>
                                <input type={showPassword ? 'text' : 'password'} name="confirm_password" value={student.confirm_password || ''} onChange={handleInputChange} placeholder={isNew ? "กรอกรหัสผ่านอีกครั้ง" : "ยืนยันรหัสผ่านใหม่"} required={isNew} />
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className={styles.passwordIcon} style={{ right: '40px' }} onClick={() => setShowPassword(!showPassword)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoSection = ({ student, handleInputChange, isNew, programs, departments }) => {
    return (
        <>
            <div className={styles.card}>
                <h3>ข้อมูลทั่วไป</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.fourCols}`}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><label>รหัสนักศึกษา</label><input type="text" name="student_id" value={student.student_id || ''} disabled={!isNew} onChange={handleInputChange} required /></div>
                        <div className={styles.formGroup}><label>คำนำหน้า (ไทย)</label><input type="text" name="prefix_th" value={student.prefix_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>ชื่อ (ไทย)</label><input type="text" name="first_name_th" value={student.first_name_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>นามสกุล (ไทย)</label><input type="text" name="last_name_th" value={student.last_name_th || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}>
                            <label>คำนำหน้า (อังกฤษ)</label>
                            <select name="prefix_en" value={student.prefix_en || 'Mr.'} onChange={handleInputChange}><option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option></select>
                        </div>
                        <div className={styles.formGroup}><label>First Name (อังกฤษ)</label><input type="text" name="first_name_en" value={student.first_name_en || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>Last Name (อังกฤษ)</label><input type="text" name="last_name_en" value={student.last_name_en || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>เบอร์โทรศัพท์</label><input type="tel" name="phone" value={student.phone || ''} onChange={handleInputChange} /></div>
                    </div>
                </div>
            </div>
            <div className={styles.card}>
                <h3>ข้อมูลการศึกษา</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.fourCols}`}>
                        <div className={styles.formGroup}>
                            <label>ระดับการศึกษา</label>
                            <select name="degree" value={student.degree || 'ปริญญาโท'} onChange={handleInputChange}><option value="ปริญญาโท">ปริญญาโท</option><option value="ปริญญาเอก">ปริญญาเอก</option></select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>หลักสูตร</label>
                            <select name="program_id" value={student.program_id || ''} onChange={handleInputChange}><option value="">-- เลือกหลักสูตร --</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        </div>
                         <div className={styles.formGroup}>
                            <label>ภาควิชา</label>
                            <select name="department_id" value={student.department_id || ''} onChange={handleInputChange}><option value="">-- เลือกภาควิชา --</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สถานะนักศึกษา</label>
                            <select name="status_id" value={student.status_id || 1} onChange={handleInputChange}><option value={1}>กำลังศึกษา</option><option value={2}>พ้นสภาพ</option><option value={3}>สำเร็จการศึกษา</option></select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ThesisSection = ({ student, advisors, handleInputChange }) => {
    // ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID เพื่อแสดงผล
    const findAdvisorName = (id) => {
        if (!id || !advisors) return '—';
        const advisor = advisors.find(a => a.advisor_id === id); 
        return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
    };

    return (
        <>
            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faUserTie} /> อาจารย์ที่ปรึกษา (ข้อมูลจากระบบ)</h3>
                <div className={styles.cardBody}>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}><label>ที่ปรึกษาหลัก:</label><input type="text" value={findAdvisorName(student.main_advisor_id)} disabled className={styles.readOnlyInput} /></div>
                        <div className={styles.formGroup}><label>ที่ปรึกษาร่วม 1:</label><input type="text" value={findAdvisorName(student.co_advisor1_id)} disabled className={styles.readOnlyInput} /></div>
                        <div className={styles.formGroup}><label>ที่ปรึกษาร่วม 2:</label><input type="text" value={findAdvisorName(student.co_advisor2_id)} disabled className={styles.readOnlyInput} /></div>
                    </div>
                </div>
            </div>
            <div className={styles.card}>
                <h3><FontAwesomeIcon icon={faBook} /> ข้อมูลวิทยานิพนธ์</h3>
                <div className={styles.cardBody}>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาไทย)</label>
                        <textarea name="thesis_title_th" value={student.thesis_title_th || ''} onChange={handleInputChange} rows="3" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ชื่อเรื่อง (ภาษาอังกฤษ)</label>
                        <textarea name="thesis_title_en" value={student.thesis_title_en || ''} onChange={handleInputChange} rows="3" />
                    </div>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}><label>วันที่อนุมัติหัวข้อ</label><input type="date" name="proposal_approval_date" value={student.proposal_approval_date?.split('T')[0] || ''} onChange={handleInputChange} /></div>
                        <div className={styles.formGroup}><label>วันที่สอบจบ</label><input type="date" name="final_defense_date" value={student.final_defense_date?.split('T')[0] || ''} onChange={handleInputChange} /></div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CommitteeSection = ({ student, advisors, handleInputChange }) => {
    const renderAdvisorOptions = (placeholder) => (
        <>
            <option value="">-- {placeholder} --</option>
            {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>
                    {`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}
                </option>
            ))}
        </>
    );

    return (
        <div className={styles.card}>
            <h3><FontAwesomeIcon icon={faUsers} /> คณะกรรมการสอบและอาจารย์ที่ปรึกษา</h3>
            <p className={styles.cardDescription}>ข้อมูลส่วนนี้จะถูกใช้เมื่อนักศึกษายื่นฟอร์มขอสอบต่างๆ</p>
            <div className={styles.cardBody}>
                <div className={styles.formSection}>
                    <h4>อาจารย์ที่ปรึกษา</h4>
                    <div className={`${styles.formGrid} ${styles.threeCols}`}>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาหลัก</label>
                            <select name="main_advisor_id" value={student.main_advisor_id || ''} onChange={handleInputChange}>{renderAdvisorOptions('เลือกอาจารย์')}</select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 1</label>
                            <select name="co_advisor1_id" value={student.co_advisor1_id || ''} onChange={handleInputChange}>{renderAdvisorOptions('ไม่มี')}</select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>อาจารย์ที่ปรึกษาร่วม 2</label>
                            <select name="co_advisor2_id" value={student.co_advisor2_id || ''} onChange={handleInputChange}>{renderAdvisorOptions('ไม่มี')}</select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PublicationsSection = ({ student, handlePublicationsChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newPub, setNewPub] = useState({ title: '', type: '', url: '' });

    const handleAdd = () => {
        if (!newPub.title) {
            alert('กรุณากรอกชื่อผลงาน');
            return;
        }
        const updated = [...(student.publications || []), newPub];
        handlePublicationsChange(updated);
        setNewPub({ title: '', type: '', url: '' });
        setIsAdding(false);
    };

    const handleDelete = (indexToDelete) => {
        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
            const updated = (student.publications || []).filter((_, index) => index !== indexToDelete);
            handlePublicationsChange(updated);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.tableHeader}>
                <h4><FontAwesomeIcon icon={faFileAlt} /> ผลงานตีพิมพ์และเอกสาร</h4>
                <button className={styles.btnSecondary} onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <FontAwesomeIcon icon={faPlus} /> เพิ่มรายการ
                </button>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>ชื่อผลงาน/เอกสาร</th>
                            <th>ประเภท</th>
                            <th>ลิงก์ (URL)</th>
                            <th className={styles.actionCell}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(student.publications || []).map((pub, index) => (
                            <tr key={index}>
                                <td>{pub.title}</td>
                                <td>{pub.type}</td>
                                <td><a href={pub.url} target="_blank" rel="noopener noreferrer">{pub.url}</a></td>
                                <td className={styles.actionCell}>
                                    <button onClick={() => handleDelete(index)} className={styles.actionBtn}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {isAdding && (
                            <tr className={styles.newRow}>
                                <td><input type="text" placeholder="ชื่อผลงาน" value={newPub.title} onChange={(e) => setNewPub({...newPub, title: e.target.value})} /></td>
                                <td><input type="text" placeholder="ประเภท (เช่น TCI1, Q1)" value={newPub.type} onChange={(e) => setNewPub({...newPub, type: e.target.value})} /></td>
                                <td><input type="text" placeholder="https://..." value={newPub.url} onChange={(e) => setNewPub({...newPub, url: e.target.value})} /></td>
                                <td className={styles.actionCell}>
                                    <button onClick={handleAdd} className={styles.actionBtnConfirm} title="ยืนยัน"><FontAwesomeIcon icon={faCheck} /></button>
                                    <button onClick={() => setIsAdding(false)} className={styles.actionBtnCancel} title="ยกเลิก"><FontAwesomeIcon icon={faTimes} /></button>
                                </td>
                            </tr>
                        )}
                        {(student.publications || []).length === 0 && !isAdding && (
                            <tr>
                                <td colSpan="4" className={styles.noDataRow}>ยังไม่มีข้อมูลผลงานตีพิมพ์</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const HistorySection = ({ documents }) => {
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH');
    };
    return (
        <div className={styles.card}>
            <h3><FontAwesomeIcon icon={faHistory} /> ประวัติการยื่นเอกสาร</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                    <thead><tr><th>ชื่อเอกสาร</th><th>วันที่ยื่น</th><th>สถานะ</th></tr></thead>
                    <tbody>
                        {documents && documents.length > 0 ? documents.map(doc => (
                            <tr key={doc.id} className={styles.clickableRow} onClick={() => navigate(`/admin/docs/${doc.id}`)}>
                                <td>{doc.type_name}</td>
                                <td>{formatDate(doc.submission_date)}</td>
                                <td><span className={`${styles.statusBadge} ${styles[doc.status_name?.toLowerCase().replace(/\s/g, '')]}`}>{doc.status_name}</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>ไม่พบประวัติการยื่นเอกสาร</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Page Component ---
function ManageStudentDetailPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const isNew = studentId === 'new';

    const [activeSection, setActiveSection] = useState('account');
    const [studentData, setStudentData] = useState(null);
    const [originalStudent, setOriginalStudent] = useState(null);
    const [relatedData, setRelatedData] = useState({ allDocs: [], advisors: [], programs: [], departments: [] });
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers = getAuthHeaders();
                // Fetch common data
                const [advisorsRes, programsRes, deptsRes] = await Promise.all([
                    fetch('http://localhost:3000/api/advisors', { headers }),
                    fetch('http://localhost:3000/api/programs', { headers }),
                    fetch('http://localhost:3000/api/departments', { headers }) // Assuming this endpoint exists
                ]);
                if (!advisorsRes.ok || !programsRes.ok || !deptsRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลพื้นฐานได้');
                const advisors = await advisorsRes.json();
                const programs = await programsRes.json();
                const departments = await deptsRes.json();
                
                if (isNew) {
                    setStudentData(INITIAL_NEW_STUDENT);
                    setOriginalStudent(_.cloneDeep(INITIAL_NEW_STUDENT));
                    setRelatedData({ allDocs: [], advisors, programs, departments });
                } else {
                    const studentRes = await fetch(`http://localhost:3000/api/admin/student/${studentId}`, { headers });
                    if (!studentRes.ok) {
                        if (studentRes.status === 404) throw new Error("ไม่พบข้อมูลนักศึกษา");
                        throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา");
                    }
                    const studentDetails = await studentRes.json();
                    setStudentData(studentDetails.profile);
                    setOriginalStudent(_.cloneDeep(studentDetails.profile));
                    setRelatedData({ allDocs: studentDetails.submissions, advisors, programs, departments });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [studentId, isNew]);

    useEffect(() => {
        if (originalStudent && studentData) {
            setIsDirty(!_.isEqual(originalStudent, studentData));
        }
    }, [studentData, originalStudent]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = async () => {
        // Validation logic
        if (isNew) {
            if (!studentData.student_id || !studentData.email || !studentData.password) {
                return alert("กรุณากรอกรหัสนักศึกษา, อีเมล และรหัสผ่าน");
            }
            if (studentData.password !== studentData.confirm_password) {
                return alert("รหัสผ่านไม่ตรงกัน");
            }
        }

        try {
            const finalStudentData = { ...studentData };
            delete finalStudentData.confirm_password;
            
            const response = isNew
                ? await fetch('http://localhost:3000/api/students', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(finalStudentData)
                })
                : await fetch(`http://localhost:3000/api/admin/student/${studentId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(finalStudentData)
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'บันทึกข้อมูลไม่สำเร็จ');
            }
            const result = await response.json();
            alert(result.message || 'บันทึกสำเร็จ!');
            if (isNew) {
                navigate('/admin/manage-users');
            } else {
                setOriginalStudent(_.cloneDeep(studentData));
            }
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleBackNavigation = () => {
        if (isDirty && !window.confirm("คุณยังไม่ได้บันทึกข้อมูล ต้องการจะออกจากหน้านี้หรือไม่?")) {
            return;
        }
        navigate('/admin/manage-users');
    };

    const renderSection = () => {
        if (!studentData) return null;
        switch (activeSection) {
            case 'account': return <AccountSection student={studentData} handleInputChange={handleInputChange} isNew={isNew} />;
            case 'info': return <InfoSection student={studentData} handleInputChange={handleInputChange} isNew={isNew} programs={relatedData.programs} departments={relatedData.departments} />;
            case 'thesis': return <ThesisSection student={studentData} advisors={relatedData.advisors} documents={relatedData.allDocs} handleInputChange={handleInputChange} />;
            case 'committee': return <CommitteeSection student={studentData} advisors={relatedData.advisors} handleInputChange={handleInputChange} />;
            case 'publications': return <PublicationsSection student={studentData} handlePublicationsChange={(d) => setStudentData(p=>({...p, publications: d}))} handleRelatedFilesChange={(d) => setStudentData(p=>({...p, related_files: d}))} />;
            case 'history': return <HistorySection documents={relatedData.allDocs} />;
            default: return <InfoSection student={studentData} handleInputChange={handleInputChange} isNew={isNew} programs={relatedData.programs} departments={relatedData.departments} />;
        }
    };

    if (loading) return <div className={styles.pageContainer}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.pageContainer}>เกิดข้อผิดพลาด: {error}</div>;
    if (!studentData) return <div className={styles.pageContainer}>กำลังเตรียมฟอร์ม...</div>;

    return (
        <div className={styles.pageLayout}>
            <SidebarManageStudent student={studentData} activeSection={activeSection} setActiveSection={setActiveSection} onBack={handleBackNavigation} isNew={isNew} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1><FontAwesomeIcon icon={faUserGraduate} /> {isNew ? 'เพิ่มข้อมูลนักศึกษาใหม่' : 'จัดการข้อมูลนักศึกษา'}</h1>
                    <button className={styles.saveButton} onClick={handleSave} disabled={!isDirty && !isNew}>
                        <FontAwesomeIcon icon={faSave} /> {isNew ? 'สร้างบัญชีนักศึกษา' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
                {renderSection()}
            </main>
        </div>
    );
}

export default ManageStudentDetailPage;