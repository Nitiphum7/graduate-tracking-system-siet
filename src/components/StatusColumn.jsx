import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/User_Page/StatusPage.module.css';

// ฟังก์ชันสำหรับแปลงวันที่ให้สวยงาม
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  };
  
  let formatted = new Intl.DateTimeFormat('th-TH', options).format(date);
  formatted = formatted.replace(',', ' เวลา').replace(':', '.') + ' น.';
  return formatted;
}

const ROWS_PER_PAGE = 5;

function StatusColumn({ title, statusType, documents }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(documents.length / ROWS_PER_PAGE) || 1;
  const indexOfLastDoc = currentPage * ROWS_PER_PAGE;
  const indexOfFirstDoc = indexOfLastDoc - ROWS_PER_PAGE;
  const currentDocs = documents.slice(indexOfFirstDoc, indexOfLastDoc);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // *** ส่วนที่เพิ่ม: กำหนดสถานะเป้าหมาย ***
  // สมมติว่าสถานะ "ไม่อนุมัติแก้ไข" ถูกส่งมาเป็น statusType === 'rejected'
  const isRejectedStatus = statusType === 'rejected'; 

  return (
    <div className={`${styles.statusBox} ${styles[statusType]}`}>
      <h3>{title}</h3>
      <ul>
        {currentDocs.length > 0 ? (
          currentDocs.map((doc) => (
            <li key={doc.id} className={styles.docItem}>
              
              {/* ลิงก์หลักสำหรับดูรายละเอียด */ }
              <Link to={`/student/docs/${doc.id}`} className={styles.docLink}>
                <span className={styles.docTitle}>{doc.type_name}</span>
                <span className={styles.docDetails}>วันที่ส่ง: {formatDateTime(doc.submission_date)}</span>
              </Link>

              {/* ส่วนที่เพิ่ม: ปุ่มแก้ไข */ }
              {isRejectedStatus && (
                <Link 
                  to={`/student/edit-doc/${doc.id}`}
                  className={styles.editButton}
                >
                  แก้ไข
                </Link>
              )}
            </li>
          ))
        ) : (
          <li className={styles.emptyMessage}>ยังไม่มีเอกสารในสถานะนี้</li>
        )}
      </ul>
      
      {/* ส่วน Pagination (ส่วนเดิม) */}
      {documents.length > ROWS_PER_PAGE && (
        <div className={styles.paginationControls}>
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>ᐸ ก่อนหน้า</button>
          <span className={styles.pageInfo}>หน้า {currentPage} / {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages}>ถัดไป ᐳ</button>
        </div>
      )}
    </div>
  );
}

export default StatusColumn;