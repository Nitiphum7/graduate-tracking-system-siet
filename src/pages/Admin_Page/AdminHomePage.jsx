import React, { useState, useEffect, useMemo } from 'react'; 
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './AdminHomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaginationControls from '../../components/admin/PaginationControls'; 
import { faInbox, faUserTie, faUserSecret, faUserShield, faFolderOpen, faFileCircleCheck, faFileCircleXmark, faHourglassHalf }
from '@fortawesome/free-solid-svg-icons';

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

const DocumentTable = ({ documents, headers, navigate }) => {
    const [filterBy, setFilterBy] = useState(headers.find(h => h.filterable)?.key || 'title');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'submission_date', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 10;

    const filteredDocs = useMemo(() => {
        if (!searchTerm) return documents;
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return documents.filter(doc => {
            const value = doc[filterBy];
            if (headers.find(h => h.key === filterBy)?.isDate) {
                const formattedDate = new Date(value || 0).toLocaleDateString('th-TH');
                return formattedDate.includes(lowercasedSearchTerm);
            }
            const valueToFilter = value ? String(value).toLowerCase() : '';
            return valueToFilter.includes(lowercasedSearchTerm);
        });
    }, [documents, searchTerm, filterBy, headers]);

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
                            {headers.map(h => (<th key={h.key} onClick={() => h.sortable && requestSort(h.key)}>{h.label}</th>))}
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

const allDocumentsHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'submission_date', label: 'วันที่ส่ง', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะปัจจุบัน', sortable: true, isStatus: true, filterable: true },
];

const pendingHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'submission_date', label: 'วันที่ส่ง', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];

const executivePendingHeaders = [
    { key: 'title', label: 'ชื่อเอกสาร', sortable: true, filterable: true },
    { key: 'studentName', label: 'ชื่อ-นามสกุล', sortable: true, filterable: true },
    { key: 'student_id', label: 'รหัสนักศึกษา', sortable: true, filterable: true },
    { key: 'submission_date', label: 'วันที่ส่ง', sortable: true, isDate: true, filterable: true },
    { key: 'status', label: 'สถานะ', sortable: true, isStatus: true, filterable: true },
];

const PendingAdvisorSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faUserTie} /> เอกสารรออาจารย์ที่ปรึกษาอนุมัติ</h1>
        <p className={styles.pageDescription}>รายการเอกสารทั้งหมดที่อยู่ในขั้นตอนรออาจารย์ที่ปรึกษาดำเนินการ</p>
        <div className={styles.statsContainer}>
            {/*  ใช้ documents.length ที่ถูกกรองมาแล้วแทน stats.pendingAdvisor */}
            <div className={styles.statCard}><p className={styles.statTitle}>รอ อ.ที่ปรึกษา</p><h2 className={styles.statValue}>{documents.length}</h2></div> 
            <div className={styles.statCard}><p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingHeaders} navigate={navigate} />
    </section>
);

const PendingExternalAdvisorSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faUserSecret} /> เอกสารรออาจารย์ภายนอกอนุมัติ</h1>
        <p className={styles.pageDescription}>รายการเอกสารทั้งหมดที่อยู่ในขั้นตอนรออาจารย์ภายนอกดำเนินการ</p>
        <div className={styles.statsContainer}>
            {/* ใช้ documents.length ที่ถูกกรองมาแล้ว */}
            <div className={styles.statCard}><p className={styles.statTitle}>รอ อ.ภายนอก</p><h2 className={styles.statValue}>{documents.length}</h2></div> 
            <div className={styles.statCard}><p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingHeaders} navigate={navigate} />
    </section>
);

const PendingExecutiveSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faUserShield} /> เอกสารรอผู้บริหารอนุมัติ</h1>
        <p className={styles.pageDescription}>รายการเอกสารทั้งหมดที่อยู่ในขั้นตอนรอผู้บริหารดำเนินการ</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p className={styles.statTitle}>รอผู้บริหาร</p><h2 className={styles.statValue}>{documents.length}</h2></div> 
            <div className={styles.statCard}><p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={executivePendingHeaders} navigate={navigate} /> {/* ใช้ executivePendingHeaders หรือ pendingHeaders */}
    </section>
);

// --- Section Components ---
const PendingReviewSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faInbox} /> เอกสารรอตรวจ</h1>
        <p className={styles.pageDescription}>เอกสารที่ยื่นโดยนักศึกษาและรอการตรวจสอบจากเจ้าหน้าที่เป็นขั้นตอนแรก</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p className={styles.statTitle}>รอเจ้าหน้าที่ตรวจ</p><h2 className={styles.statValue}>{stats.pendingAdmin}</h2></div>
            <div className={styles.statCard}><p className={styles.statTitle}>เอกสารในระบบทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={pendingHeaders} navigate={navigate} />
    </section>
);
const AllDocumentsSection = ({ documents, stats, navigate }) => (
    <section className={styles.contentSection}>
        <h1><FontAwesomeIcon icon={faFolderOpen} /> เอกสารทั้งหมด</h1>
        <p className={styles.pageDescription}>ภาพรวมและรายการเอกสารทั้งหมดในระบบ</p>
        <div className={styles.statsContainer}>
            <div className={styles.statCard}><p className={styles.statTitle}><FontAwesomeIcon icon={faFolderOpen} /> ทั้งหมด</p><h2 className={styles.statValue}>{stats.totalDocs}</h2></div>
            <div className={styles.statCard}><p className={styles.statTitle}><FontAwesomeIcon icon={faHourglassHalf} /> กำลังดำเนินการ</p><h2 className={styles.statValue}>{stats.inProgress}</h2></div>
            <div className={styles.statCard}><p className={styles.statTitle}><FontAwesomeIcon icon={faFileCircleCheck} /> อนุมัติแล้ว</p><h2 className={styles.statValue}>{stats.approved}</h2></div>
            <div className={styles.statCard}><p className={styles.statTitle}><FontAwesomeIcon icon={faFileCircleXmark} /> ส่งกลับ/ปฏิเสธ</p><h2 className={styles.statValue}>{stats.rejected}</h2></div>
        </div>
        <DocumentTable documents={documents} headers={allDocumentsHeaders} navigate={navigate} />
    </section>
);
// --- Component หลัก ---
function AdminHomePage() {
    const [stats, setStats] = useState({});
    const [allDocs, setAllDocs] = useState({ all: [], pendingReview: [], pendingAdvisor: [], pendingExternalAdvisor: [] , pendingExecutive: [],}); 
    const [loading, setLoading] = useState(true);
    const { activeSection, setNotifications } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        const loadAdminData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/admin/all-data', { headers: getAuthHeaders() });
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลจาก Server ได้');
                
                const data = await response.json();
                
                setStats(data.stats);

                const allDocumentsFromServer = data.documents;

                const adminReviewStatuses = [
                    'รอตรวจสอบ',            
                    'รอเจ้าหน้าที่ตรวจสอบ',    
                    'รอเจ้าหน้าที่ยืนยัน',      
                ];

                const pendingReview = allDocumentsFromServer.filter(doc => adminReviewStatuses.includes(doc.status));

                const advisorStatuses = [
                    'รออาจารย์ที่ปรึกษาอนุมัติ',
                    'รออาจารย์ที่ปรึกษาหลักอนุมัติ',
                    'รออาจารย์ที่ปรึกษา (3 ท่าน) อนุมัติ',
                ];
                
                const pendingAdvisor = allDocumentsFromServer.filter(doc => 
                    advisorStatuses.includes(doc.status));

                const externalAdvisorStatuses = [
                    'รออาจารย์ภายนอกอนุมัติ',      
                    'รออาจารย์สำรองภายนอกอนุมัติ', 
            
                ];
                const pendingExternalAdvisor = allDocumentsFromServer.filter(doc => 
                    externalAdvisorStatuses.includes(doc.status)
                );

                const executiveStatuses = [
                    'รออธิการบดีอนุมัติ',     
                ];
                const pendingExecutive = allDocumentsFromServer.filter(doc => 
                    executiveStatuses.includes(doc.status)
                );


                setAllDocs({
                    all: allDocumentsFromServer,
                    pendingReview: pendingReview,
                    pendingAdvisor: pendingAdvisor,
                    pendingExternalAdvisor: pendingExternalAdvisor,
                    pendingExecutive: pendingExecutive,
                });
                
                if (setNotifications) setNotifications({});

            } catch (error) {
                console.error("Failed to load admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, [activeSection, setNotifications]);

    const renderSection = () => {
        switch (activeSection) {
            case 'pending-review':
                return <PendingReviewSection documents={allDocs.pendingReview} stats={stats} navigate={navigate} />;
            case 'pending-advisor': 
                return <PendingAdvisorSection documents={allDocs.pendingAdvisor} stats={stats} navigate={navigate} />;
            case 'pending-external-advisor': 
                return <PendingExternalAdvisorSection documents={allDocs.pendingExternalAdvisor} stats={stats} navigate={navigate} />;
            case 'pending-executive': 
                return <PendingExecutiveSection documents={allDocs.pendingExecutive} stats={stats} navigate={navigate} />;
            case 'all-documents':
                return <AllDocumentsSection documents={allDocs.all} stats={stats} navigate={navigate} />;
            // เพิ่ม case อื่นๆ ตาม sidebar ของคุณ
            default:
                return <AllDocumentsSection documents={allDocs.all} stats={stats} navigate={navigate} />;
        }
    };

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className={styles.pageContainer}>
            {renderSection()}
        </div>
    );
}

export default AdminHomePage;