import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './AdminHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaginationControls from '../../components/admin/PaginationControls';
import { faInbox, faUserTie, faUserSecret, faUserShield, faFolderOpen, faFileCircleCheck, faFileCircleXmark, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

// --- Component ตารางที่สามารถใช้ซ้ำได้ (โค้ดเดิม) ---
const DocumentTable = ({ documents, headers, navigate }) => {
    const [filterBy, setFilterBy] = useState(headers.find(h => h.filterable)?.key || 'title');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'submitted_date', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 10;

    const filteredDocs = useMemo(() => {
        if (!searchTerm) return documents;
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return documents.filter(doc => {
            const value = doc[filterBy] ? String(doc[filterBy]).toLowerCase() : '';
            return value.includes(lowercasedSearchTerm);
        });
    }, [documents, searchTerm, filterBy]);

    const sortedDocs = useMemo(() => {
        let sortableDocs = [...filteredDocs];
        if (sortConfig.key) {
            sortableDocs.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableDocs;
    }, [filteredDocs, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterBy, documents]);

    const requestSort = (key) => {
        let order = 'asc';
        if (sortConfig.key === key && sortConfig.order === 'asc') order = 'desc';
        setSortConfig({ key, order });
    };

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = sortedDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(sortedDocs.length / docsPerPage);

    return (
        <div className={styles.tableCard}>
            <div className={styles.filterContainer}>
                <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className={styles.filterSelect}>
                    {headers.filter(h => h.filterable).map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                </select>
                <input type="text" placeholder={`ค้นหาจาก "${headers.find(h => h.key === filterBy)?.label}"...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.filterInput} />
            </div>
            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            {headers.map(h => (<th key={h.key} onClick={() => h.sortable && requestSort(h.key)} className={h.sortable ? styles.sortableHeader : ''}>{h.label}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentDocs.length > 0 ? currentDocs.map(doc => (
                            <tr key={doc.doc_id} className={styles.clickableRow} onClick={() => navigate(`/admin/docs/${doc.doc_id}`)}>
                                {headers.map(h => (
                                    <td key={`${doc.doc_id}-${h.key}`}>
                                        {h.isStatus ? <span className={`${styles.status} ${styles[doc.status?.toLowerCase().replace(/\s/g, '')]}`}>{doc.status}</span>
                                            : h.isDate ? new Date(doc[h.key] || 0).toLocaleDateString('th-TH')
                                            : doc[h.key]}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td colSpan={headers.length} className={styles.noDataRow}>ไม่มีข้อมูลในรายการนี้</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
    );
};

// --- Headers Config (โค้ดเดิม) ---
const pendingReviewHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'submitted_date', label: 'วันที่ส่ง', sortable: true, isDate: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true },
];

const allDocumentsHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'submitted_date', label: 'วันที่ส่ง', sortable: true, isDate: true },
    { key: 'status', label: 'สถานะปัจจุบัน', sortable: true, isStatus: true, filterable: true },
];

// --- Section Components (โค้ดเดิม) ---
const PendingReviewSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faInbox} /> เอกสารรอตรวจ</h1>
        <p className={styles.pageDescription}>เอกสารที่ยื่นโดยนักศึกษาและรอการตรวจสอบจากเจ้าหน้าที่เป็นขั้นตอนแรก</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p>รอเจ้าหน้าที่ตรวจ</p><h2>{stats.pendingAdmin || 0}</h2></div>
            <div className={styles.statCard}><p>เอกสารในระบบทั้งหมด</p><h2>{stats.totalDocs || 0}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingReviewHeaders} navigate={navigate} />
    </section>
);

const PendingAdvisorSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faUserTie} /> อาจารย์ที่ปรึกษาอนุมัติ</h1>
        <p>เอกสารที่ถูกส่งต่อไปยังอาจารย์ที่ปรึกษาเพื่อรอการอนุมัติ</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p>กำลังรออนุมัติ</p><h2>{stats.pendingAdvisor || 0}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingReviewHeaders} navigate={navigate} />
    </section>
);

const AllDocumentsSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faFolderOpen} /> เอกสารทั้งหมด</h1>
        <p className={styles.pageDescription}>ภาพรวมและรายการเอกสารทั้งหมดในระบบ</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p><FontAwesomeIcon icon={faHourglassHalf} /> กำลังดำเนินการ</p><h2>{stats.inProgress || 0}</h2></div>
            <div className={styles.statCard}><p><FontAwesomeIcon icon={faFileCircleCheck} /> อนุมัติแล้ว</p><h2>{stats.approved || 0}</h2></div>
            <div className={styles.statCard}><p><FontAwesomeIcon icon={faFileCircleXmark} /> ส่งกลับ/ปฏิเสธ</p><h2>{stats.rejected || 0}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={allDocumentsHeaders} navigate={navigate} />
    </section>
);

// --- Component หลัก ---
function AdminHomePage() {
    const [stats, setStats] = useState({});
    const [allDocs, setAllDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeSection } = useOutletContext();
    const navigate = useNavigate();

    // ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
    // ✅         ส่วนที่แก้ไขทั้งหมดอยู่ตรงนี้        ✅
    // ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
    useEffect(() => {
        const loadAdminData = async () => {
            setLoading(true);
            try {
                // 1. ดึง Token ที่บันทึกไว้ตอน Login ออกมาจาก localStorage
                const token = localStorage.getItem('token');

                // 1.1 (สำคัญ) ถ้าไม่มี Token เลย ให้ส่งไปหน้า Login
                if (!token) {
                    navigate('/login'); // หรือ path ไปยังหน้า login ของคุณ
                    return;
                }

                // 2. เพิ่ม Authorization header เข้าไปใน Options ของ fetch
                const response = await fetch('http://localhost:3000/api/admin/all-data', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // <--- จุดที่สำคัญที่สุด
                    }
                });

                // 3. จัดการกับกรณีที่ Token หมดอายุ หรือไม่ถูกต้อง (Server ตอบ 401 หรือ 403)
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token'); // ลบ token ที่ใช้ไม่ได้แล้ว
                    navigate('/login'); // ส่งกลับไปหน้า login
                    throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
                }

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลได้');
                }

                const data = await response.json();
                setStats(data.stats || {});
                setAllDocs(data.documents || []);

            } catch (error) {
                console.error("Failed to load admin data:", error);
                // อาจจะตั้งค่า state เพื่อแสดงข้อความ error บน UI
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, [navigate]); // เพิ่ม navigate เข้าไปใน dependency array ของ useEffect
    // ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
    // ✅             จบส่วนที่แก้ไข             ✅
    // ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

    const documentsForSection = useMemo(() => {
        if (!activeSection) return allDocs.filter(doc => doc.status === 'รอตรวจสอบ'); // Default
        switch (activeSection) {
            case 'pending-review':
                return allDocs.filter(doc => doc.status === 'รอตรวจสอบ');
            case 'pending-advisor':
                return allDocs.filter(doc => doc.status === 'รออาจารย์ที่ปรึกษาอนุมัติ');
            case 'pending-external':
                return allDocs.filter(doc => doc.status === 'รออาจารย์บัณฑิตพิเศษอนุมัติ');
            case 'pending-executive':
                return allDocs.filter(doc => doc.status === 'รอประธานหลักสูตรอนุมัติ');
            case 'all-documents':
                return allDocs;
            default:
                return allDocs.filter(doc => doc.status === 'รอตรวจสอบ');
        }
    }, [allDocs, activeSection]);

    const renderSection = () => {
        const sectionProps = { stats, navigate, documents: documentsForSection };

        switch (activeSection) {
            case 'pending-review':
                return <PendingReviewSection {...sectionProps} />;
            case 'pending-advisor':
                return <PendingAdvisorSection {...sectionProps} />;
            case 'pending-external':
                // คุณต้องสร้าง Component นี้ตามตัวอย่างด้านบน
                return <div>หน้าสำหรับอาจารย์ภายนอก (ยังไม่ได้สร้าง Component)</div>; // ตัวอย่างชั่วคราว
            case 'pending-executive':
                // คุณต้องสร้าง Component นี้ตามตัวอย่างด้านบน
                return <div>หน้าสำหรับผู้บริหาร (ยังไม่ได้สร้าง Component)</div>; // ตัวอย่างชั่วคราว
            case 'all-documents':
                return <AllDocumentsSection {...sectionProps} />;
            default:
                return <PendingReviewSection {...sectionProps} />;
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>กำลังโหลดข้อมูล...</div>;

    return (
        <div className={styles.pageContainer}>
            {renderSection()}
        </div>
    );
}

export default AdminHomePage;