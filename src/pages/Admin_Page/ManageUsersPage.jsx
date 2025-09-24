// src/pages/Admin_Page/ManageUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUserGraduate, faUserTie, faPlus, faFilter, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Import ตารางที่เราสร้างขึ้นมาใหม่
import StudentTable from '../../components/admin/StudentTable';
import AdvisorTable from '../../components/admin/AdvisorTable'; // ✅ 1. Import AdvisorTable

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartCard = ({ data, labels }) => {
    const chartData = {
        labels: labels,
        datasets: [{
            label: ' จำนวน',
            data: data,
            backgroundColor: ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
    };
    return <div className={styles.chartContainer}><Pie data={chartData} options={options} /></div>;
};


function ManageUsersPage() {
    const { activeSection } = useOutletContext();
    const [masterData, setMasterData] = useState({ students: [], advisors: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // ✅✅✅ แก้ไขบรรทัดนี้: เปลี่ยนจาก 'user_token' เป็น 'token' ✅✅✅
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No token found!");
                    // เพิ่มการป้องกัน: อาจจะนำทางผู้ใช้กลับไปหน้า login
                    // navigate('/login'); 
                    setLoading(false); // หยุดการโหลด
                    return;
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [studentsRes, advisorsRes] = await Promise.all([
                    fetch('/api/students', { headers }),
                    fetch('/api/advisors', { headers })
                ]);

                if (!studentsRes.ok || !advisorsRes.ok) {
                    // หาก Token หมดอายุ (Server ตอบกลับ 401 หรือ 403)
                    if (studentsRes.status === 401 || studentsRes.status === 403 || advisorsRes.status === 401 || advisorsRes.status === 403) {
                         console.error("Token is invalid or expired.");
                         // อาจจะเคลียร์ token เก่าแล้วพาไปหน้า login
                         // localStorage.removeItem('token');
                         // navigate('/login');
                    }
                    throw new Error('ไม่สามารถดึงข้อมูลจาก Server ได้');
                }

                const students = await studentsRes.json();
                const advisors = await advisorsRes.json();

             console.log("ข้อมูล ADVISORS ที่ได้รับจาก SERVER:", advisors); 

                setMasterData({ students, advisors });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    const handleAddNewStudent = () => {
        navigate('/admin/manage-users/student/new');
    };
    
    const handleAddNewAdvisor = () => {
        navigate('/admin/manage-users/advisor/new');
    };

    const handleDeleteStudent = (studentIdToDelete) => {
        if (window.confirm(`คุณต้องการลบนักศึกษา ID: ${studentIdToDelete} ใช่หรือไม่?`)) {
            const updatedStudents = masterData.students.filter(student => student.student_id !== studentIdToDelete);
            
            setMasterData(prevData => ({
                ...prevData,
                students: updatedStudents
            }));

            localStorage.setItem('savedStudents', JSON.stringify(updatedStudents));
            
            alert(`ลบนักศึกษา ID: ${studentIdToDelete} เรียบร้อยแล้ว`);
        }
    };

    // ✅ 1. เพิ่มฟังก์ชันสำหรับลบอาจารย์
    const handleDeleteAdvisor = (advisorIdToDelete) => {
        if (window.confirm(`คุณต้องการลบข้อมูลอาจารย์ ID: ${advisorIdToDelete} ใช่หรือไม่?`)) {
            // กรองข้อมูลอาจารย์ที่จะลบออก
            const updatedAdvisors = masterData.advisors.filter(advisor => advisor.advisor_id !== advisorIdToDelete);

            // อัปเดต State
            setMasterData(prevData => ({
                ...prevData,
                advisors: updatedAdvisors
            }));

            // อัปเดต Local Storage
            localStorage.setItem('savedAdvisors', JSON.stringify(updatedAdvisors));
            
            alert(`ลบข้อมูลอาจารย์ ID: ${advisorIdToDelete} เรียบร้อยแล้ว`);
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'students':
                return <ManageStudentsSection students={masterData.students} advisors={masterData.advisors} navigate={navigate} />;
            case 'advisors':
                return <ManageAdvisorsSection 
                            advisors={masterData.advisors} 
                            onAddNewAdvisor={handleAddNewAdvisor}
                            navigate={navigate}
                            // ✅ 2. ส่งฟังก์ชันลบลงไปเป็น prop
                            onDeleteAdvisor={handleDeleteAdvisor}
                        />;
            case 'overview':
            default:
                return <OverviewSection students={masterData.students} advisors={masterData.advisors} />;
        }
    };

    return (
        <div>{renderSection()}</div>
    );
}

// ... ส่วนของ OverviewSection, ManageStudentsSection, และ ManageAdvisorsSection เหมือนเดิม ...
const OverviewSection = ({ students, advisors }) => {
    const masterStudents = students.filter(s => s.degree === 'ปริญญาโท').length;
    const phdStudents = students.filter(s => s.degree === 'ปริญญาเอก').length;

    const internalAdvisors = advisors.filter(a => a.type === 'อาจารย์ประจำ').length;
    const externalAdvisors = advisors.filter(a => a.type === 'อาจารย์บัณฑิตพิเศษภายนอก').length;
    const executives = advisors.filter(a => a.type === 'ผู้บริหาร').length;
    
    return (
        <section>
            <h1><FontAwesomeIcon icon={faChartPie} /> ภาพรวมผู้ใช้งาน</h1>
            <p>สรุปจำนวนและสัดส่วนผู้ใช้งานทั้งหมดในระบบ</p>
            <div className={styles.overviewGrid}>
                <div className={styles.summaryCard}>
                    <h4><FontAwesomeIcon icon={faUserGraduate} /> ภาพรวมนักศึกษา</h4>
                    <div className={styles.statGrid}>
                        <div className={styles.statItem}><label>ทั้งหมด</label><span>{students.length}</span></div>
                        <div className={styles.statItem}><label>ปริญญาโท</label><span>{masterStudents}</span></div>
                        <div className={styles.statItem}><label>ปริญญาเอก</label><span>{phdStudents}</span></div>
                    </div>
                    <PieChartCard 
                        labels={['ปริญญาโท', 'ปริญญาเอก']}
                        data={[masterStudents, phdStudents]}
                    />
                </div>
                <div className={styles.summaryCard}>
                    <h4><FontAwesomeIcon icon={faUserTie} /> ภาพรวมบุคลากร</h4>
                    <div className={styles.statGrid}>
                        <div className={styles.statItem}><label>ทั้งหมด</label><span>{advisors.length}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายใน</label><span>{internalAdvisors}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายนอก</label><span>{externalAdvisors}</span></div>
                        <div className={styles.statItem}><label>ผู้บริหาร</label><span>{executives}</span></div>
                    </div>
                    <PieChartCard 
                        labels={['อาจารย์ภายใน', 'อาจารย์ภายนอก', 'ผู้บริหาร']}
                        data={[internalAdvisors, externalAdvisors, executives]}
                    />
                </div>
            </div>
        </section>
    );
};

const ManageStudentsSection = ({ students, advisors, navigate }) => {
    const [filteredStudents, setFilteredStudents] = useState(students);
    const [filters, setFilters] = useState({ studentId: '', name: '', email: '', advisorId: '' });

    // ใช้ useEffect เพื่ออัปเดต filteredStudents เมื่อ students หลักมีการเปลี่ยนแปลง (เช่น การลบ)
    useEffect(() => {
        let data = [...students];
        if (filters.studentId) data = data.filter(s => s.student_id.includes(filters.studentId));
        if (filters.name) data = data.filter(s => `${s.first_name_th} ${s.last_name_th}`.toLowerCase().includes(filters.name.toLowerCase()));
        if (filters.email) data = data.filter(s => s.email.toLowerCase().includes(filters.email.toLowerCase()));
        if (filters.advisorId) data = data.filter(s => s.main_advisor_id === filters.advisorId);
        setFilteredStudents(data);
    }, [filters, students]); // เพิ่ม students ใน dependency array

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ studentId: '', name: '', email: '', advisorId: '' });
    };

    return (
        <section>
            <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการรายชื่อนักศึกษา</h1>
            <p>เพิ่ม แก้ไข และดูข้อมูลนักศึกษาทั้งหมดในระบบ</p>
            <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                    <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูลนักศึกษา</h3>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterGroup}><label htmlFor="studentId">รหัสนักศึกษา</label><input type="text" id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="name">ชื่อ-นามสกุล</label><input type="text" id="name" name="name" value={filters.name} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="email">อีเมล</label><input type="text" id="email" name="email" value={filters.email} onChange={handleFilterChange} placeholder="ค้นหา..." /></div>
                        <div className={styles.filterGroup}><label htmlFor="advisorId">อาจารย์ที่ปรึกษาหลัก</label><select id="advisorId" name="advisorId" value={filters.advisorId} onChange={handleFilterChange}><option value="">ทั้งหมด</option>{advisors?.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}</select></div>
                    </div>
                    <div className={styles.filterActions}><button onClick={resetFilters}><FontAwesomeIcon icon={faUndo} /> ล้างการค้นหา</button></div>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่อนักศึกษา ({filteredStudents.length})</h2>
                    <button className={styles.btnPrimary} onClick={onAddNewStudent}><FontAwesomeIcon icon={faPlus} /> เพิ่มนักศึกษาใหม่</button>
                </div>
                <StudentTable 
                    students={filteredStudents} 
                    advisors={advisors} 
                    onDelete={onDeleteStudent} 
                />
            </div>
        </section>
    );
};

const ManageAdvisorsSection = ({ advisors }) => {
    return (
        <section>
            <h1><FontAwesomeIcon icon={faUserTie} /> จัดการรายชื่ออาจารย์</h1>
            <p>เพิ่ม แก้ไข และกำหนดบทบาทของอาจารย์ในระบบ</p>
            <div className={styles.tableCard}>
            <div className={styles.tableCard}>
                <div className={styles.filterCard}>
                    <h3><FontAwesomeIcon icon={faFilter} /> ตัวกรองข้อมูล</h3>
                </div>
                <div className={styles.tableHeader}>
                    <h2>รายชื่ออาจารย์ ({filteredAdvisors.length})</h2>
                    <button className={styles.btnPrimary} onClick={onAddNewAdvisor}><FontAwesomeIcon icon={faPlus} /> เพิ่มอาจารย์ใหม่</button>
                </div>
                
                {/* ✅ 4. ส่งฟังก์ชัน onDelete ต่อไปให้ AdvisorTable */}
                <AdvisorTable 
                    advisors={filteredAdvisors} 
                    navigate={navigate}
                    onDelete={onDeleteAdvisor}
                />
            </div>
        </section>
    );
};

export default ManageUsersPage;