// ในไฟล์ ExamResultDetail.js

import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faPaperclip, faTasks, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

function ExamResultDetail({ doc, user }) {
    
    // ✅ 1. อ่านข้อมูลจาก doc.form_details เป็นหลัก
    const details = doc.form_details || {};
    const scores = details.scores || {};
    const files = details.files || [];
    const API_URL = 'http://localhost:3000';

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่น</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                <li><label>หลักสูตร:</label> <span>{user.program_name || 'ไม่พบข้อมูลหลักสูตร'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faTasks} /> รายละเอียดผลสอบ</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {/* ✅ 2. อ่านข้อมูลจาก details ที่เราดึงมาจาก form_details */}
                    {details.exam_type && <li><label>ประเภทการสอบ:</label> <span>{details.exam_type}</span></li>}
                    {details.exam_date && <li><label>วันที่สอบ:</label> <span>{new Date(details.exam_date).toLocaleDateString('th-TH')}</span></li>}
                    {details.result && <li><label>ผลการสอบ (QE):</label> <span>{details.result}</span></li>}
                </ul>
            </div>

            {/* ส่วนแสดงคะแนน (ถ้ามี) */}
            {Object.keys(scores).length > 0 && (
                <div className={styles.subsection}>
                    <h5>คะแนน</h5>
                    <ul className={`${styles.infoList} ${styles.compact}`}>
                        {Object.entries(scores).map(([key, value]) => (
                            <li key={key}><label style={{ textTransform: 'capitalize' }}>{key}:</label> <span>{value}</span></li>
                        ))}
                    </ul>
                </div>
            )}

            <hr className={styles.subtleDivider} />
            <h4><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบ</h4>
            <div className={styles.subsection}>
                <ul className={styles.infoList}>
                    {/* ✅ 3. อ่านข้อมูลไฟล์จาก files ที่เราดึงมาจาก form_details */}
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <li key={index}>
                                <label>หลักฐานผลสอบ:</label> 
                                <a href={`${API_URL}${file.path}`} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                   <FontAwesomeIcon icon={faFilePdf} /> {file.name}
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>ไม่มีไฟล์แนบ</li>
                    )}
                </ul>
            </div>
        </>
    );
}

export default ExamResultDetail;