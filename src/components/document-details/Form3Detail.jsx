import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faPaperclip, faUserGraduate, faBook, faUsers } from '@fortawesome/free-solid-svg-icons';

// ✅ 1. เพิ่มฟังก์ชันสำหรับจัดรูปแบบวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Form3Detail({ doc, user, advisors }) {

    const findAdvisorName = (advisorId) => {
        if (!advisorId || !advisors || advisors.length === 0) return '-';
        const advisor = advisors.find(a => 
            String(a.advisor_id) === String(advisorId) || 
            String(a.id) === String(advisorId)
        );
        return advisor 
            ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() 
            : 'ไม่พบข้อมูลอาจารย์';
    };

    // --- ดึงข้อมูลจาก Props ---
    // ✅ 2. เพิ่มการดึงชื่อประธานและที่ปรึกษาร่วม 2
    const mainAdvisorName = findAdvisorName(user?.main_advisor_id);
    const coAdvisor1Name = findAdvisorName(user?.co_advisor1_id);
    const coAdvisor2Name = findAdvisorName(user?.co_advisor2_id);
    const programChairName = findAdvisorName(user?.proposal_chair_id);

    const details = doc.form_details || {};
    const files = details.files || [];
    const API_URL = 'http://localhost:3000';

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่นคำร้อง</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                <li><label>หลักสูตร:</label> <span>{user.program_name || '-'}</span></li>
                <li><label>ภาควิชา:</label> <span>{user.department_name || '-'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faBook} /> ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
            <ul className={styles.infoList}>
                {/* ✅ 3. เพิ่มการแสดงผลวันที่อนุมัติ */}
                <li><label>วันที่อนุมัติ:</label> <span>{formatSimpleDate(user?.proposal_approval_date)}</span></li>
                <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{user.thesis_title_th || '-'}</span></li>
                <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{user.thesis_title_en || '-'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> อาจารย์ผู้รับผิดชอบ</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {/* ✅ 4. เพิ่มการแสดงผลประธานและที่ปรึกษาร่วม 2 */}
                    <li><label>ประธานกรรมการสอบ (จากฟอร์ม 2):</label> <span>{programChairName}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
                    <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label> <span>{coAdvisor2Name}</span></li>
                </ul>
            </div>

            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบ</h4>
            <ul className={styles.infoList}>
                {files.length > 0 ? (
                    files.map((file, index) => (
                        <li key={index}>
                        {/* ✅ โค้ดที่แนะนำให้แก้ไข: สร้างตัวแปร Label ที่เหมาะสม */}
                        <label>
                            {file.type === 'document_file' 
                                ? 'ไฟล์เค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์' // แสดงข้อความภาษาไทยแทน document_file
                                : file.type || 'ไฟล์แนบ'}
                            :
                        </label>
                        
                        {/* ส่วนลิงก์ที่แก้ไขไปแล้ว (ถูกต้อง) */}
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
        </>
    );
}

export default Form3Detail;