import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faBook, faUsers, faPaperclip, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

function Form2Detail({ doc, user, advisors }) {

    const findAdvisorName = (advisorId) => {
        if (!advisorId || !advisors || advisors.length === 0) return '-';
        const advisor = advisors.find(a => 
            String(a.advisor_id) === String(advisorId) || 
            String(a.id) === String(advisorId)
        );
        return advisor ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() : 'ไม่พบข้อมูลอาจารย์';
    };
    
    // ดึงข้อมูลอาจารย์ที่ปรึกษาล่าสุดจากโปรไฟล์
    const mainAdvisorName = findAdvisorName(user?.main_advisor_id);
    const coAdvisor1Name = findAdvisorName(user?.co_advisor1_id);

    // ดึงข้อมูลรายละเอียดจาก form_details
    const details = doc.form_details || {};
    const committee = details.committee || {};
    const files = details.files || [];

    // ค้นหาชื่อกรรมการทั้งหมดที่เสนอในฟอร์มนี้
    const chairName = findAdvisorName(committee.chair_id);
    const coAdvisor2Name = findAdvisorName(committee.co_advisor2_id);
    const member5Name = findAdvisorName(committee.member5_id);
    const reserveExternalName = findAdvisorName(committee.reserve_external_id);
    const reserveInternalName = findAdvisorName(committee.reserve_internal_id);

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
            
            <h4><FontAwesomeIcon icon={faBook} /> หัวข้อวิทยานิพนธ์</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อเรื่อง (ไทย):</label> <span>{details.thesis_title_th || '-'}</span></li>
                <li><label>ชื่อเรื่อง (อังกฤษ):</label> <span>{details.thesis_title_en || '-'}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> อาจารย์ที่ปรึกษา (ข้อมูลล่าสุด)</h4>
            <ul className={styles.infoList}>
                <li><label>ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
                <li><label>ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> คณะกรรมการสอบที่เสนอชื่อ</h4>
            <ul className={styles.infoList}>
                <li><label>ประธานกรรมการสอบ:</label> <span>{chairName}</span></li>
                <li><label>กรรมการ (ที่ปรึกษาร่วม 2):</label> <span>{coAdvisor2Name}</span></li>
                <li><label>กรรมการคนที่ 5:</label> <span>{member5Name}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> กรรมการสำรองที่เสนอชื่อ</h4>
            <ul className={styles.infoList}>
                <li><label>กรรมการสำรอง (จากภายนอก):</label> <span>{reserveExternalName}</span></li>
                <li><label>กรรมการสำรอง (จากภายใน):</label> <span>{reserveInternalName}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faPaperclip} /> เอกสารแนบ</h4>
            <ul className={styles.infoList}>
                {files.length > 0 ? (
                    files.map((file, index) => (
                        <li key={index}>
                            <label>{file.type || 'ไฟล์แนบ'}:</label>
                            
                            <a 
                                href={new URL(file.path, API_URL).href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.fileLink}
                            >
                                {/* ⭐ เพิ่มไอคอน PDF พร้อมกำหนดสี ⭐ */}
                                <FontAwesomeIcon 
                                    icon={faFilePdf} 
                                    style={{ marginRight: '5px', color: '#dc3545' }} 
                                /> {file.name}
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

export default Form2Detail;
