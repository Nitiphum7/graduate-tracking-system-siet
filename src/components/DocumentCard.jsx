// src/components/DocumentCard.jsx
import React from 'react';
import styles from './DocumentCard.module.css'; // เราจะสร้างไฟล์ CSS นี้ในขั้นตอนถัดไป

// ฟังก์ชันสำหรับแปลงเวลาให้สวยงาม
function formatDateTime(isoString) {
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


function DocumentCard({ doc }) {
  return (
    <div className={styles.card}>
      {/* 1. แสดงชื่อเอกสาร */}
      <h4 className={styles.title}>{doc.type_name}</h4>
      
      {/* 2. แสดงวันที่และเวลาที่ส่ง */}
      <p className={styles.date}>วันที่ส่ง: {formatDateTime(doc.submission_date)}</p>
    </div>
  );
}

export default DocumentCard;