import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faPaperclip, faTasks, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

// ⭐ [แก้ไข] จุดที่ 1: แก้ไขฟังก์ชัน getRemainingDetails 
const getRemainingDetails = (details) => {
    // เอา 'reading_score', 'listening_score' ออกจากลิสต์ เพื่อให้แสดงผลได้
    const excludedKeys = [
        'exam_type', 'exam_date', 'files', 'scores', 'result', 
        'student_comment', 'submission_date', 'committee', 
        'evaluators', 'document_types'
    ]; 
    
    const remaining = Object.entries(details)
        .filter(([key, value]) => 
            !excludedKeys.includes(key) && 
            value !== null && 
            value !== undefined && 
            value !== ''
        );
 
    const thaiLabels = {
        'READING SCORE': 'คะแนน Reading',
        'LISTENING SCORE': 'คะแนน Listening',
        'TOTAL SCORE': 'คะแนนรวม'
    };

    const formattedDetails = remaining
        .map(([key, value]) => {
            const englishLabel = key.replace(/_/g, ' ').toUpperCase();
            return {
                label: thaiLabels[englishLabel] || englishLabel,
                value: value
            };
        });
        
    return formattedDetails.sort((a, b) => {
        const labelA = a.label;
        const labelB = b.label;
        if (labelA.includes('การอ่าน')) return -1;
        if (labelB.includes('การอ่าน')) return 1;
        if (labelA.includes('การฟัง')) return -1;
        if (labelB.includes('การฟัง')) return 1;
        if (labelA.includes('รวม')) return 1;
        if (labelB.includes('รวม')) return -1;
        return 0;
    });
};

// ⭐ [แก้ไข] จุดที่ 2: แก้ไข Component หลัก
function ExamResultDetail({ doc, user }) {
    if (!doc || !user) {
        return <div>กำลังโหลดข้อมูลเอกสาร...</div>; 
    }

    const details = doc.form_details || {};
    const files = details.files || [];
    const API_URL = 'http://localhost:3000';

    // Logic ส่วนนี้จะกลับมามีความสำคัญอีกครั้ง
    const remainingDetails = getRemainingDetails(details);
    const overallItem = remainingDetails.find(item => item.label.includes('คะแนนรวม'));
    const overallResult = details.result || overallItem?.value;
    const overallResultLabel = details.result ? 'ผลการสอบหลัก' : 'ผลรวม';
    const isOverallScoreShownSeparately = !!overallResult && !details.result;

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่น</h4>
            <ul className={styles.infoList}>
                {/* ... ส่วนข้อมูลผู้ยื่น ... */}
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th || ''} ${user.first_name_th || ''} ${user.last_name_th || ''}`}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                {user.degree && <li><label>ระดับการศึกษา:</label> <span>{user.degree}</span></li>}
                <li><label>หลักสูตร:</label> <span>{user.program_name || 'ไม่พบข้อมูลหลักสูตร'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faTasks} /> รายละเอียดผลสอบ</h4>
            <div className={styles.subsection}>
                {/* นำการแสดงผลแบบเดิมที่แสดง "ผลการสอบหลัก" กลับมา */}
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {details.exam_type && <li><label>ประเภทการสอบ:</label> <span>{details.exam_type}</span></li>}
                    {details.exam_date && <li><label>วันที่สอบ:</label> <span>{new Date(details.exam_date).toLocaleDateString('th-TH')}</span></li>}
                    {overallResult && <li><label>{overallResultLabel}:</label> <span>{overallResult}</span></li>}
                </ul>
            </div>

            {/* นำส่วน "คะแนน / ข้อมูลเพิ่มเติม" กลับมาแสดง */}
            {(() => {
                const otherScores = remainingDetails.filter(item => 
                    !(isOverallScoreShownSeparately && item.label.includes('คะแนนรวม'))
                );
                return otherScores.length > 0 && (
                    <div className={styles.subsection}>
                        <h5>คะแนน / ข้อมูลเพิ่มเติม</h5>
                        <ul className={`${styles.infoList} ${styles.compact}`}>
                            {otherScores.map((item) => (
                                <li key={item.label}><label>{item.label}:</label> <span>{item.value}</span></li>
                            ))}
                        </ul>
                    </div>
                );
            })()}

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบ</h4>
            <div className={styles.subsection}>
                <ul className={styles.infoList}>
                    {/* ... ส่วนเอกสารแนบ (ถูกต้องอยู่แล้ว) ... */}
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <li key={index}>
                                <label>ไฟล์แนบ:</label> 
                                <a 
                                    href={new URL(file.path, API_URL).href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={styles.fileLink}
                                >
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