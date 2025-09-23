import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faUserGraduate, faBook, faUsers, faPaperclip } from '@fortawesome/free-solid-svg-icons';

// Object สำหรับแปล key ของไฟล์เป็นภาษาไทย
const fileKeyToLabelMap = {
    thesisDraftFile: 'วิทยานิพนธ์ฉบับสมบูรณ์',
    abstractThFile: 'บทคัดย่อ (ภาษาไทย)',
    abstractEnFile: 'บทคัดย่อ (ภาษาอังกฤษ)',
    tocThFile: 'สารบัญ (ภาษาไทย)',
    tocEnFile: 'สารบัญ (ภาษาอังกฤษ)',
    publicationProofFile: 'หลักฐานการตีพิมพ์',
    gradeCheckProofFile: 'หลักฐานผลการเรียน',
};

function Form6Detail({ doc, user, advisors }) {
    const findAdvisorName = (id) => {
        if (!id || !advisors) return '-';
        const advisor = advisors.find(a => a.id === id || a.advisor_id === id);
        return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
    };
    
    // อ่านข้อมูลรายละเอียดจาก doc.form_details
    const details = doc.form_details || {};
    const committee = details.committee || {};
    const files = details.files || {}; // เป็น Object

    // อ่านข้อมูลโปรไฟล์ล่าสุดจาก prop 'user'
    const mainAdvisorName = findAdvisorName(user.main_advisor_id);
    const coAdvisor1Name = findAdvisorName(user.co_advisor1_id);

    // ค้นหาชื่อกรรมการที่เสนอในฟอร์มนี้ทั้งหมด
    const chairName = findAdvisorName(committee.chair_id);
    const coAdvisor2Name = findAdvisorName(committee.co_advisor2_id);
    const member5Name = findAdvisorName(committee.member5_id);
    const reserveExternalName = findAdvisorName(committee.reserve_external_id);
    const reserveInternalName = findAdvisorName(committee.reserve_internal_id);

    const API_URL = 'http://localhost:3000';

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่นคำร้อง</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>ชื่อ-นามสกุล:</label> <span>{user.fullname}</span></li>
                    <li><label>รหัสนักศึกษา:</label> <span>{user.student_id || '-'}</span></li>
                    <li><label>หลักสูตร/สาขาวิชา:</label> <span>{user.program_name || '-'}</span></li>
                </ul>
            </div>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faBook} /> ข้อมูลวิทยานิพนธ์</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>ชื่อเรื่อง (ไทย):</label> <span className={styles.thesisTitle}>{user.thesis_title_th || '-'}</span></li>
                    <li><label>ชื่อเรื่อง (อังกฤษ):</label> <span className={styles.thesisTitle}>{user.thesis_title_en || '-'}</span></li>
                </ul>
            </div>

            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> คณะกรรมการสอบและอาจารย์ที่ปรึกษา</h4>
            <div className={styles.subsection}>
                <h5>อาจารย์ที่ปรึกษา (จากระบบ)</h5>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
                    <li><label>ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
                </ul>
            </div>
            
            {/* ✅✅✅ ส่วนที่อัปเดตตามที่คุณต้องการ ✅✅✅ */}
            <div className={styles.subsection}>
                <h5>คณะกรรมการสอบ</h5>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>ประธานกรรมการสอบ:</label> <span>{chairName}</span></li>
                    <li><label>กรรมการ (ที่ปรึกษาร่วม 2):</label> <span>{coAdvisor2Name}</span></li>
                    <li><label>กรรมการสอบ (คนที่ 5):</label> <span>{member5Name}</span></li>
                </ul>
            </div>
            <div className={styles.subsection}>
                <h5>กรรมการสำรอง</h5>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>กรรมการสำรอง (จากภายนอก):</label> <span>{reserveExternalName}</span></li>
                    <li><label>กรรมการสำรอง (จากภายใน):</label> <span>{reserveInternalName}</span></li>
                </ul>
            </div>
            {/* ✅✅✅ จบส่วนที่อัปเดต ✅✅✅ */}
            
            <hr className={styles.subtleDivider} />
            <h4><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบ</h4>
            <div className={styles.subsection}>
                <ul className={styles.infoList}>
                    {Object.keys(files).length > 0 ? (
                        Object.entries(files).map(([key, file]) => (
                            <li key={key}>
                                <label>{fileKeyToLabelMap[key] || key}:</label>
                                <a href={`${API_URL}${file.path}`} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                    <FontAwesomeIcon icon={faFilePdf} /> {file.name}
                                </a>
                            </li>
                        ))
                    ) : ( <li>ไม่มีไฟล์แนบ</li> )}
                </ul>
            </div>
        </>
    );
}

export default Form6Detail;