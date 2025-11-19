// src/components/admin/StudentTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Admin_Page/ManageUsersPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPencilAlt, 
    faTrashAlt, 
    faSort, 
    faSortUp, 
    faSortDown,
    faSearch // 💡 1. Import ไอคอนค้นหา
} from '@fortawesome/free-solid-svg-icons';
import PaginationControls from './PaginationControls';

function StudentTable({ students, advisors, onDelete }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: 'student_id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // 💡 2. เพิ่ม State สำหรับเก็บค่าค้นหา
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm]); // 💡 3. เพิ่ม searchTerm ใน dependency

    const sortedStudents = useMemo(() => {
        // 💡 4. เริ่มด้วยการกรองข้อมูลก่อน (Filtering Logic)
        let filteredItems = [...students];
        
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(student => {
                const fullName = `${student.prefix_th || ''}${student.first_name_th || ''} ${student.last_name_th || ''}`.toLowerCase();
                const email = (student.email || '').toLowerCase();
                const studentId = (student.student_id || '').toLowerCase();

                return fullName.includes(lowerCaseSearch) ||
                       email.includes(lowerCaseSearch) ||
                       studentId.includes(lowerCaseSearch);
            });
        }

        // 💡 5. นำข้อมูลที่กรองแล้วมาจัดเรียง (Sorting Logic)
        if (sortConfig.key !== null) {
            filteredItems.sort((a, b) => {
                let valA = a[sortConfig.key] || '';
                let valB = b[sortConfig.key] || '';

                if (sortConfig.key === 'first_name_th') {
                    valA = `${a.first_name_th} ${a.last_name_th}`;
                    valB = `${b.first_name_th} ${b.last_name_th}`;
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredItems;
    }, [students, sortConfig, searchTerm]); // 💡 6. เพิ่ม searchTerm

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return faSort;
        return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
    };

    const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
    const currentTableData = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            {/* 💡 7. เพิ่มแถบค้นหา (Search Bar) 💡 */}
            <div className={styles.searchContainer}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="ค้นหานักศึกษา (ชื่อ, อีเมล, รหัส)..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* 💡 สิ้นสุดแถบค้นหา 💡 */}

            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('student_id')} className={sortConfig.key === 'student_id' ? styles.active : ''}>รหัสนักศึกษา <FontAwesomeIcon icon={getSortIcon('student_id')} /></th>
                            <th onClick={() => requestSort('first_name_th')} className={sortConfig.key === 'first_name_th' ? styles.active : ''}>ชื่อ-นามสกุล <FontAwesomeIcon icon={getSortIcon('first_name_th')} /></th>
                            <th onClick={() => requestSort('email')} className={sortConfig.key === 'email' ? styles.active : ''}>อีเมล <FontAwesomeIcon icon={getSortIcon('email')} /></th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ที่ปรึกษาหลัก</th>
                            <th style={{ textAlign: 'center' }}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.length > 0 ? (
                            currentTableData.map((student) => {
                                const mainAdvisor = advisors.find(a => a.advisor_id === student.main_advisor_id);
                                const advisorName = mainAdvisor ? `${mainAdvisor.prefix_th}${mainAdvisor.first_name_th} ${mainAdvisor.last_name_th}`.trim() : '-';
                                return (
                                    <tr key={student.student_id} className={styles.clickableRow} onClick={() => navigate(`/admin/manage-users/student/${student.student_id}`)}>
                                        <td>{student.student_id}</td>
                                        <td>{`${student.prefix_th}${student.first_name_th} ${student.last_name_th}`}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone || '-'}</td>
                                        <td>{advisorName}</td>
                                        <td className={styles.actionCell}>
                                            <button className={styles.actionBtn} title="แก้ไข" onClick={(e) => { e.stopPropagation(); navigate(`/admin/manage-users/student/${student.student_id}`) }}>
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </button>
                                            <button className={styles.actionBtn} title="ลบ" onClick={(e) => { e.stopPropagation(); onDelete(student.student_id); }}>
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                {/* 💡 8. เปลี่ยนข้อความเมื่อไม่พบข้อมูล */}
                                <td colSpan="6" className={styles.noDataRow}>
                                    {searchTerm ? 'ไม่พบข้อมูลนักศึกษาที่ตรงกับการค้นหา' : 'ไม่พบข้อมูลนักศึกษา'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                 <div className={styles.pagination}>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </>
    );
}

export default StudentTable;