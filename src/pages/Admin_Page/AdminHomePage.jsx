import React, { useState, useEffect, useMemo } from 'react'; // แก้ไข: เพิ่ม useMemo
import { useNavigate } from 'react-router-dom';
import styles from './AdminHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaginationControls from '../../components/admin/PaginationControls';
import { faInbox, faCheckCircle, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

// --- Component ย่อยสำหรับ "เอกสารรอตรวจ" ---
const PendingReviewSection = ({ pendingDocs, stats }) => {
    const [filterBy, setFilterBy] = useState('title');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_date', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 10;
    const navigate = useNavigate();

    const sortedAndFilteredDocs = useMemo(() => {
        let filtered = pendingDocs.filter(doc => {
            if (!searchTerm) return true;
            const valueToFilter = doc[filterBy] ? String(doc[filterBy]).toLowerCase() : '';
            return valueToFilter.includes(searchTerm.toLowerCase());
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [pendingDocs, searchTerm, filterBy, sortConfig]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 on new filter/search
    }, [searchTerm, filterBy]);
    
    const requestSort = (key) => {
        let order = 'asc';
        if (sortConfig.key === key && sortConfig.order === 'asc') {
            order = 'desc';
        }
        setSortConfig({ key, order });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.order === 'asc' ? faSortUp : faSortDown;
    };

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = sortedAndFilteredDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);

    return (
        <section className={styles.contentSection}>
            <h1><FontAwesomeIcon icon={faInbox} /> เอกสารรอตรวจ</h1>
            <div className={styles.statsContainer}>
                <div className={styles.statCard}><p>เอกสารรอตรวจทั้งหมด</p><h2>{stats.pendingAdmin}</h2></div>
                <div className={styles.statCard}><p>เอกสารในระบบทั้งหมด</p><h2>{stats.totalDocs}</h2></div>
            </div>
            <div className={styles.tableCard}>
                <div className={styles.filterContainer}>
                    <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className={styles.filterSelect}>
                        <option value="title">ชื่อเอกสาร</option>
                        <option value="doc_id">รหัสเอกสาร</option>
                        <option value="student_id">รหัสนักศึกษา</option>
                        <option value="studentName">ชื่อ-นามสกุล</option>
                    </select>
                    <input type="text" placeholder={`ค้นหา...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.filterInput} />
                </div>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('doc_id')}>รหัสเอกสาร <FontAwesomeIcon icon={getSortIcon('doc_id')} /></th>
                                <th onClick={() => requestSort('title')}>ชื่อเอกสาร <FontAwesomeIcon icon={getSortIcon('title')} /></th>
                                <th onClick={() => requestSort('studentName')}>ชื่อ-นามสกุล <FontAwesomeIcon icon={getSortIcon('studentName')} /></th>
                                <th onClick={() => requestSort('submitted_date')}>วันที่ส่ง <FontAwesomeIcon icon={getSortIcon('submitted_date')} /></th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentDocs.length > 0 ? currentDocs.map(doc => (
                                <tr key={doc.doc_id} className={styles.clickableRow} onClick={() => navigate(`/admin/document/${doc.doc_id}`)}>
                                    <td>{doc.doc_id}</td>
                                    <td>{doc.title}</td>
                                    <td>{doc.studentName}</td>
                                    <td>{new Date(doc.submitted_date).toLocaleDateString('th-TH')}</td>
                                    <td><span className={`${styles.status} ${styles.pending}`}>{doc.status}</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>ไม่มีเอกสารรอตรวจในขณะนี้</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </div>
        </section>
    );
};

// --- Component หลัก ---
function AdminHomePage() {
    const [dashboardData, setDashboardData] = useState({
        stats: { pendingAdmin: 0, totalDocs: 0 },
        pendingDocs: [],
        activities: [],
    });
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:3000'; // ควรย้ายไปไฟล์ config

    // ✅✅✅ --- แก้ไข useEffect ให้ไปดึงข้อมูลจาก Server --- ✅✅✅
    useEffect(() => {
        const loadAdminData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/admin/dashboard`);
                if (!response.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลแดชบอร์ดแอดมินได้");
                }
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to load admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, []);

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    // ส่งข้อมูลที่ได้จาก API ไปให้ Component ย่อย
    return (
        <div>
            <PendingReviewSection 
                pendingDocs={dashboardData.pendingDocs} 
                stats={dashboardData.stats} 
            />
        </div>
    );
}

export default AdminHomePage;