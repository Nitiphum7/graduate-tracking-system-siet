import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css';

const AdviseeTable = ({ students, advisorId }) => {
    const navigate = useNavigate();

    const handleRowClick = (studentId) => {
        navigate(`/admin/manage-users/student/${studentId}`);
    };

    const renderAdvisorRole = (roleValue) => {
        if (!roleValue || roleValue === 'ไม่เกี่ยวข้อง') {
            return 'ไม่ระบุ';
        }
        if (roleValue.includes('ที่ปรึกษาหลัก')) {
            return <span className={`${styles.status} ${styles.statusMain}`}>{roleValue}</span>;
        }
        if (roleValue.includes('ที่ปรึกษาร่วม')) {
            return <span className={`${styles.status} ${styles.statusCo}`}>{roleValue}</span>;
        }
        return roleValue;
    };

    return (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                    <tr>
                        <th>รหัสนักศึกษา</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อีเมล</th>
                        <th>ระดับการศึกษา</th>
                        <th>หลักสูตร</th>
                        <th>บทบาท</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                        students.map((student) => (
                            <tr
                                key={student.student_id || student.user_id}
                                className={styles.clickableRow}
                                onClick={() => handleRowClick(student.student_id)}
                            >
                                <td>{student.student_id}</td>
                                <td>{`${student.prefix_th || ''}${student.first_name_th || ''} ${student.last_name_th || ''}`}</td>
                                <td>{student.email}</td>
                                <td>{student.degree || '-'}</td>
                                <td>{student.program_name || '-'}</td>
                                <td>{renderAdvisorRole(student.advisor_role)}</td>
                                <td>{student.status || 'ไม่ระบุ'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className={styles.noDataRow}>
                                ไม่มีนักศึกษาในที่ปรึกษา
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdviseeTable;