import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyTasksPage.module.css'; // ใช้ CSS ร่วมกันหรือสร้างใหม่
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ApprovalModal from '../../components/advisor/ApprovalModal'; // Component Modal ที่จะสร้างในขั้นตอนถัดไป

function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // State สำหรับ Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // ฟังก์ชันสำหรับดึงข้อมูลรายการที่ต้องอนุมัติ
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:3000/api/approvals/my-tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('กรุณาเข้าสู่ระบบใหม่');
            }

            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // ฟังก์ชันเมื่อกดปุ่ม "ดำเนินการ"
    const handleProcessClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };
    const handleSubmitApproval = async (status, comment) => {
        if (!selectedTask) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/approvals/${selectedTask.task_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newStatus: status, 
                    comment: comment
                })
            });

            if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการดำเนินการ');

            // เมื่อสำเร็จ ให้ลบ Task นั้นออกจาก List เพื่อให้ UI อัปเดตทันที
            setTasks(prevTasks => prevTasks.filter(task => task.task_id !== selectedTask.task_id));
            setIsModalOpen(false); // ปิด Modal
            setSelectedTask(null);

        } catch (err) {
            console.error("Approval failed:", err);
            setError("Approval failed: " + err.message);
            // อาจจะแสดงข้อความ Error บน Modal แทน
        }
    };


    if (loading) {
        return <div className={styles.loadingContainer}><FontAwesomeIcon icon={faSpinner} spin size="2x" /> กำลังโหลด...</div>;
    }

    if (error) {
        return <div className={styles.errorContainer}>เกิดข้อผิดพลาด: {error}</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.contentSection}>
                <h1><FontAwesomeIcon icon={faListCheck} /> รายการรออนุมัติ</h1>
                <p className={styles.pageDescription}>เอกสารที่กำลังรอการตรวจสอบและอนุมัติจากคุณ</p>

                <div className={styles.tableCard}>
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ชื่อเอกสาร</th>
                                    <th>ชื่อนักศึกษา</th>
                                    <th>วันที่ส่ง</th>
                                    <th>ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? tasks.map(task => (
                                    <tr key={task.task_id}>
                                        <td 
                                            className={styles.clickableCell}
                                            onClick={() => navigate(`/advisor/docs/${task.submission_id}`, { state: { taskId: task.task_id } })}
                                        >
                                            {task.document_title}
                                        </td>
                                        <td>{task.student_name}</td>
                                        <td>{new Date(task.submission_date).toLocaleDateString('th-TH')}</td>
                                        <td>
                                            <button 
                                                className={styles.actionButton}
                                                onClick={() => handleProcessClick(task)}
                                            >
                                                ดำเนินการ
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className={styles.noDataRow}>ไม่มีเอกสารรออนุมัติ</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            
            {isModalOpen && (
                <ApprovalModal 
                    task={selectedTask}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmitApproval}
                />
            )}
        </div>
    );
}

export default MyTasksPage;