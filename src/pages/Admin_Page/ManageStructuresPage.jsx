import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faGraduationCap, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './ManageStructuresPage.module.css';

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

function ManageStructuresPage() {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 1. ปรับ State: เพิ่ม degree_level เข้าไปใน formData
    const [formData, setFormData] = useState({ id: null, name: '', degree_level: '' });
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getAuthHeaders();
            const [deptsRes, programsRes] = await Promise.all([
                fetch('http://localhost:3000/api/departments', { headers }),
                fetch('http://localhost:3000/api/programs', { headers })
            ]);

            if (!deptsRes.ok) throw new Error('Failed to fetch departments');
            if (!programsRes.ok) throw new Error('Failed to fetch programs');

            const deptsData = await deptsRes.json();
            const programsData = await programsRes.json();

            setDepartments(deptsData);
            setPrograms(programsData);

        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch structure data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (isEdit = false, item = null) => {
        setIsEditMode(isEdit);
        if (isEdit && item) {
            // Pre-fill form for editing, including degree_level for programs
            setFormData({ 
                id: item.id, 
                name: item.name, 
                degree_level: item.degree_level || '' 
            });
        } else {
            // Reset form for adding
            setFormData({ id: null, name: '', degree_level: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ id: null, name: '', degree_level: '' });
    };

    // ✅ 2. ปรับ handleFormChange: ให้รองรับหลาย input fields
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validation check
        if (!formData.name.trim()) {
            alert('กรุณากรอกชื่อ');
            return;
        }
        if (activeTab === 'programs' && !formData.degree_level.trim()) {
            alert('กรุณาเลือกระดับปริญญา');
            return;
        }

        const endpoint = activeTab === 'departments' ? 'departments' : 'programs';
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `http://localhost:3000/api/${endpoint}/${formData.id}` : `http://localhost:3000/api/${endpoint}`;

        // ✅ 3. ปรับการส่งข้อมูล: ส่งข้อมูลให้ครบตามที่ Backend ต้องการ
        const bodyPayload = activeTab === 'departments'
            ? { name: formData.name }
            : { name: formData.name, degree_level: formData.degree_level };

        try {
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} ${activeTab}`);
            }

            alert(`บันทึกข้อมูล${activeTab === 'departments' ? 'ภาควิชา' : 'หลักสูตร'}สำเร็จ!`);
            fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }

        const endpoint = activeTab === 'departments' ? 'departments' : 'programs';
        try {
            const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete ${activeTab}`);
            }

            alert(`ลบข้อมูล${activeTab === 'departments' ? 'ภาควิชา' : 'หลักสูตร'}สำเร็จ!`);
            fetchData();
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    if (loading) return <div className={styles.container}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div className={styles.container}>เกิดข้อผิดพลาด: {error}</div>;

    const currentData = activeTab === 'departments' ? departments : programs;
    const isProgramsTab = activeTab === 'programs';

    return (
        <div className={styles.container}>
            <div className={styles.contentHeader}>
                <h1><FontAwesomeIcon icon={faBuilding} /> จัดการโครงสร้าง</h1>
                <p>จัดการข้อมูลภาควิชาและหลักสูตรในระบบ</p>
                <button className={styles.addButton} onClick={() => handleOpenModal(false)}>
                    <FontAwesomeIcon icon={faPlus} /> เพิ่ม{activeTab === 'departments' ? 'ภาควิชา' : 'หลักสูตร'}
                </button>
            </div>

            <div className={styles.tabContainer}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'departments' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('departments')}
                >
                    <FontAwesomeIcon icon={faBuilding} /> ภาควิชา ({departments.length})
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'programs' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('programs')}
                >
                    <FontAwesomeIcon icon={faGraduationCap} /> หลักสูตร ({programs.length})
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h2><FontAwesomeIcon icon={isProgramsTab ? faGraduationCap : faBuilding} /> 
                        รายการ{isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}
                    </h2>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                {/* ✅ 4. ปรับตาราง: เพิ่มคอลัมน์ "ระดับปริญญา" */}
                                {isProgramsTab && <th style={{width: '150px'}}>ระดับปริญญา</th>}
                                <th>ชื่อ{isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}</th>
                                <th style={{width: '120px', textAlign: 'center'}}>ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map(item => (
                                    <tr key={item.id}>
                                        {isProgramsTab && <td>{item.degree_level}</td>}
                                        <td>{item.name}</td>
                                        <td className={styles.actionCell}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.editBtn}`} 
                                                onClick={() => handleOpenModal(true, item)}
                                                title="แก้ไข"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                                                onClick={() => handleDelete(item.id, item.name)}
                                                title="ลบ"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isProgramsTab ? "3" : "2"} style={{ textAlign: 'center', padding: '20px' }}>
                                        ยังไม่มีข้อมูล{isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{isEditMode ? 'แก้ไข' : 'เพิ่ม'}{isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}</h3>
                        
                        {/* ✅ 5. ปรับ Modal: เพิ่มช่องกรอก "ระดับปริญญา" */}
                        {isProgramsTab && (
                            <div className={styles.formGroup}>
                                <label>ระดับปริญญา</label>
                                <select
                                    name="degree_level"
                                    value={formData.degree_level}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">-- เลือกระดับปริญญา --</option>
                                    <option value="ปริญญาโท">ปริญญาโท</option>
                                    <option value="ปริญญาเอก">ปริญญาเอก</option>
                                </select>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>ชื่อ{isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder={`กรอกชื่อ${isProgramsTab ? 'หลักสูตร' : 'ภาควิชา'}`}
                                required
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.btnSecondary} onClick={handleCloseModal}>ยกเลิก</button>
                            <button className={styles.btnPrimary} onClick={handleSubmit}>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageStructuresPage;

