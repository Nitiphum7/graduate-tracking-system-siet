import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับแปลงวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 1. แก้ไขให้ Component รับ props ที่เป็นข้อมูลพร้อมใช้
function Form3Detail({ doc, studentInfo, approvedThesisInfo, advisorNames }) {

    return (
        <>
            <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
            <ul className={styles.infoList}>
                {/* 2. ใช้ข้อมูลจาก studentInfo */}
                <li><label>ชื่อ-นามสกุล:</label> <span>{studentInfo?.fullname || '-'}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{studentInfo?.student_id || '-'}</span></li>
                <li><label>หลักสูตร:</label> <span>{studentInfo?.programName || '-'}</span></li>
                <li><label>ภาควิชา:</label> <span>{studentInfo?.departmentName || '-'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4>ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
            <ul className={styles.infoList}>
                {/* 3. ใช้ข้อมูลจาก approvedThesisInfo */}
                <li><label>วันที่อนุมัติ:</label> <span>{formatSimpleDate(approvedThesisInfo?.approval_date)}</span></li>
                <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{approvedThesisInfo?.title_th || '-'}</span></li>
                <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{approvedThesisInfo?.title_en || '-'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />

            <h4>อาจารย์ผู้รับผิดชอบ</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {/* 4. ใช้ข้อมูลจาก advisorNames */}
                    <li><label>ประธานกรรมการสอบ (จากฟอร์ม 2):</label> <span>{advisorNames?.programChairName || '-'}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาหลัก:</label> <span>{advisorNames?.mainAdvisorName || '-'}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label> <span>{advisorNames?.coAdvisor1Name || '-'}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label> <span>{advisorNames?.coAdvisor2Name || '-'}</span></li>
                </ul>
            </div>

            <hr className={styles.subtleDivider} />
            <h4>เอกสารแนบ</h4>
            <ul className={styles.infoList}>
                {doc.files && doc.files.length > 0 ? (
                    doc.files.map((file, index) => (
                        <li key={index}>
                            <label>{file.type}:</label>
                            <a href="#" onClick={(e) => e.preventDefault()} className={styles.fileLink}>
                                {file.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <li>ไม่มีไฟล์แนบ</li>
                )}
            </ul>
        </>
    );
}

export default Form3Detail;
