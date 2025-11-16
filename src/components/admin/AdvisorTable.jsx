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

function AdvisorTable({ advisors, onDelete }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // 💡 2. เพิ่ม State สำหรับเก็บค่าค้นหา
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [advisors, searchTerm]); // 💡 3. เพิ่ม searchTerm (ถ้าค้นหาใหม่ ให้กลับไปหน้า 1)

    const sortedAdvisors = useMemo(() => {
        // 💡 4. เริ่มด้วยการกรองข้อมูลก่อน
        let filteredItems = [...advisors];
        
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(advisor => {
                const fullName = `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.toLowerCase();
                const email = (advisor.email || '').toLowerCase();
                const advisorId = (advisor.advisor_id || '').toLowerCase();

                return fullName.includes(lowerCaseSearch) ||
                       email.includes(lowerCaseSearch) ||
                       advisorId.includes(lowerCaseSearch);
            });
        }
        
        // 💡 5. นำข้อมูลที่กรองแล้วมาจัดเรียง
        if (sortConfig.key) {
            filteredItems.sort((a, b) => {
                let valA, valB;
                if (sortConfig.key === 'full_name') {
                    valA = `${a.first_name_th} ${a.last_name_th}`;
                    valB = `${b.first_name_th} ${b.last_name_th}`;
                } else {
                    valA = a[sortConfig.key] || '';
                    valB = b[sortConfig.key] || '';
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredItems;
    }, [advisors, sortConfig, searchTerm]); // 💡 6. เพิ่ม searchTerm ใน dependency

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

    const totalPages = Math.ceil(sortedAdvisors.length / itemsPerPage);
    const currentTableData = sortedAdvisors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleRowClick = (advisorId) => {
        navigate(`/admin/manage-users/advisor/${advisorId}`);
    };

    return (
        <>
            {/* 💡 7. เพิ่มแถบค้นหา (Search Bar) 💡 */}
            <div className={styles.searchContainer}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="ค้นหาอาจารย์ (ชื่อ, อีเมล, รหัส)..."
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
                            <th onClick={() => requestSort('full_name')} className={sortConfig.key === 'full_name' ? styles.active : ''}>ชื่อ-นามสกุล <FontAwesomeIcon icon={getSortIcon('full_name')} /></th>
                            <th onClick={() => requestSort('email')} className={sortConfig.key === 'email' ? styles.active : ''}>อีเมล <FontAwesomeIcon icon={getSortIcon('email')} /></th>
                            <th>เบอร์โทรศัพท์</th>
                            <th onClick={() => requestSort('type')} className={sortConfig.key === 'type' ? styles.active : ''}>ประเภท <FontAwesomeIcon icon={getSortIcon('type')} /></th>
                            <th>บทบาท (Roles)</th>
                            <th style={{ textAlign: 'center' }}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.length > 0 ? (
                            currentTableData.map((advisor) => (
                                <tr key={advisor.advisor_id} className={styles.clickableRow} onClick={() => handleRowClick(advisor.advisor_id)}>
                                    <td>{`${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`}</td>
                                    <td>{advisor.email || '-'}</td>
                                    <td>{advisor.phone || '-'}</td>
                                    <td>{advisor.type || '-'}</td>
                                    <td>{advisor.roles && advisor.roles.length > 0 ? advisor.roles.join(', ') : 'ยังไม่ได้กำหนด'}</td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionBtn} title="แก้ไข" onClick={(e) => { e.stopPropagation(); handleRowClick(advisor.advisor_id); }}>
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                        </button>
                                        <button className={styles.actionBtn} title="ลบ" onClick={(e) => { e.stopPropagation(); onDelete(advisor.advisor_id); }}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* 💡 8. เปลี่ยนข้อความให้สอดคล้องกับการค้นหา */}
                                <td colSpan="6" className={styles.noDataRow}>
                                    {searchTerm ? 'ไม่พบข้อมูลอาจารย์ที่ตรงกับการค้นหา' : 'ไม่พบข้อมูลอาจารย์'}
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

export default AdvisorTable;