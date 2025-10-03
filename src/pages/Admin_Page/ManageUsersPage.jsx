import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUserGraduate, faUserTie, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Import Components ที่จะรับ Props
import StudentTable from '../../components/admin/StudentTable';
import AdvisorTable from '../../components/admin/AdvisorTable';

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function สำหรับสร้าง Header
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

// --- Main Page Component ---
function ManageUsersPage() {
    const { activeSection } = useOutletContext();
    const navigate = useNavigate();

    // State หลักสำหรับเก็บข้อมูลทั้งหมด
    const [masterData, setMasterData] = useState({ students: [], advisors: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ฟังก์ชันดึงข้อมูลจาก Server
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = getAuthHeaders();
            const [studentsRes, advisorsRes] = await Promise.all([
                fetch('http://localhost:3000/api/students', { headers }),
                fetch('http://localhost:3000/api/advisors', { headers })
            ]);

            if (!studentsRes.ok || !advisorsRes.ok) {
                throw new Error('Failed to fetch data from server.');
            }

            const studentsData = await studentsRes.json();
            const advisorsData = await advisorsRes.json();
            setMasterData({ students: studentsData, advisors: advisorsData });
        } catch (error) {
            setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ฟังก์ชันลบนักศึกษา (เชื่อม Endpoint)
    const handleDeleteStudent = async (studentIdToDelete) => {
        if (window.confirm(`คุณต้องการลบนักศึกษา ID: ${studentIdToDelete} ใช่หรือไม่?`)) {
            try {
                const response = await fetch(`http://localhost:3000/api/students/${studentIdToDelete}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete student.');
                }
                alert(`ลบนักศึกษา ID: ${studentIdToDelete} เรียบร้อยแล้ว`);
                // ดึงข้อมูลใหม่หลังลบสำเร็จ
                fetchData();
            } catch (err) {
                alert(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        }
    };

    // ฟังก์ชันลบอาจารย์ (เชื่อม Endpoint)
    const handleDeleteAdvisor = async (advisorIdToDelete) => {
        if (window.confirm(`คุณต้องการลบข้อมูลอาจารย์ ID: ${advisorIdToDelete} ใช่หรือไม่?`)) {
            try {
                const response = await fetch(`http://localhost:3000/api/advisors/${advisorIdToDelete}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete advisor.');
                }
                alert(`ลบข้อมูลอาจารย์ ID: ${advisorIdToDelete} เรียบร้อยแล้ว`);
                // ดึงข้อมูลใหม่หลังลบสำเร็จ
                fetchData();
            } catch (err) {
                alert(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        }
    };

    if (loading) return <p className={styles.loadingText}>Loading data from server...</p>;
    if (error) return <p className={styles.errorText}>{error}</p>;

    // ฟังก์ชัน Render หลัก
    const renderSection = () => {
        switch (activeSection) {
            case 'students':
                return (
                    <section>
                        <h1><FontAwesomeIcon icon={faUserGraduate} /> จัดการรายชื่อนักศึกษา</h1>
                        <p>เพิ่ม แก้ไข และดูข้อมูลนักศึกษาทั้งหมดในระบบ</p>
                        <div className={styles.tableCard}>
                             <div className={styles.tableHeader}>
                                <h2>รายชื่อนักศึกษา</h2>
                                <button className={styles.btnPrimary} onClick={() => navigate('/admin/manage-users/student/new')}>
                                    <FontAwesomeIcon icon={faPlus} /> เพิ่มนักศึกษาใหม่
                                </button>
                            </div>
                            <StudentTable
                                students={masterData.students}
                                advisors={masterData.advisors}
                                onDelete={handleDeleteStudent}
                            />
                        </div>
                    </section>
                );
            case 'advisors':
                 return (
                    <section>
                        <h1><FontAwesomeIcon icon={faUserTie} /> จัดการรายชื่ออาจารย์</h1>
                        <p>เพิ่ม แก้ไข และกำหนดบทบาทของอาจารย์ในระบบ</p>
                        <div className={styles.tableCard}>
                            <div className={styles.tableHeader}>
                                <h2>รายชื่ออาจารย์</h2>
                                <button className={styles.btnPrimary} onClick={() => navigate('/admin/manage-users/advisor/new')}>
                                    <FontAwesomeIcon icon={faPlus} /> เพิ่มอาจารย์ใหม่
                                </button>
                            </div>
                            <AdvisorTable
                                advisors={masterData.advisors}
                                onDelete={handleDeleteAdvisor}
                            />
                        </div>
                    </section>
                );
            case 'overview':
            default:
                return <OverviewSection students={masterData.students} advisors={masterData.advisors} />;
        }
    };

    return <div>{renderSection()}</div>;
}

const PieChartCard = ({ data, labels }) => {
    const chartData = {
        labels: labels,
        datasets: [{
            label: ' จำนวน', data: data,
            backgroundColor: ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981'],
            borderColor: '#FFFFFF', borderWidth: 2,
        }],
    };
    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
    };
    return <div className={styles.chartContainer}><Pie data={chartData} options={options} /></div>;
};

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
                    <PieChartCard labels={['ปริญญาโท', 'ปริญญาเอก']} data={[masterStudents, phdStudents]} />
                </div>
                <div className={styles.summaryCard}>
                    <h4><FontAwesomeIcon icon={faUserTie} /> ภาพรวมบุคลากร</h4>
                    <div className={styles.statGrid}>
                        <div className={styles.statItem}><label>ทั้งหมด</label><span>{advisors.length}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายใน</label><span>{internalAdvisors}</span></div>
                        <div className={styles.statItem}><label>อาจารย์ภายนอก</label><span>{externalAdvisors}</span></div>
                        <div className={styles.statItem}><label>ผู้บริหาร</label><span>{executives}</span></div>
                    </div>
                    <PieChartCard labels={['อาจารย์ภายใน', 'อาจารย์ภายนอก', 'ผู้บริหาร']} data={[internalAdvisors, externalAdvisors, executives]} />
                </div>
            </div>
        </section>
    );
};
export default ManageUsersPage;