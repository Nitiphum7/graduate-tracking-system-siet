import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// 1. นำ studentProfile ออกจาก props เพราะไม่ได้ใช้แล้ว
function Form2Detail({ doc, user, advisors }) {

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

    // 2. ลบตัวแปร mainAdvisorName และ coAdvisor1Name ออก
    
    // ข้อมูลกรรมการยังคงดึงมาเหมือนเดิม
    const committee = doc.committee || {};
    const chairName = findAdvisorName(committee.chair_id);
    const coAdvisor2Name = findAdvisorName(committee.co_advisor2_id);
    const member5Name = findAdvisorName(committee.member5_id);
    const reserveExternalName = findAdvisorName(committee.reserve_external_id);
    const reserveInternalName = findAdvisorName(committee.reserve_internal_id);

    const API_URL = 'http://localhost:3000';

    return (
        <>
            <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                <li><label>หลักสูตร:</label> <span>{user.program_name || '-'}</span></li>
                <li><label>ภาควิชา:</label> <span>{user.department_name || '-'}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />
            
            <h4>หัวข้อวิทยานิพนธ์</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อเรื่อง (ไทย):</label> <span>{doc.thesis_title_th || '-'}</span></li>
                <li><label>ชื่อเรื่อง (อังกฤษ):</label> <span>{doc.thesis_title_en || '-'}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            {/* 3. ลบส่วนแสดงผล "อาจารย์ที่ปรึกษา" ทั้งหมดออก */}

            <h4>คณะกรรมการสอบที่เสนอชื่อ</h4>
            <ul className={styles.infoList}>
                <li><label>ประธานกรรมการสอบ:</label> <span>{chairName}</span></li>
                <li><label>กรรมการ (ที่ปรึกษาร่วม 2):</label> <span>{coAdvisor2Name}</span></li>
                <li><label>กรรมการสอบ (คนที่ 5):</label> <span>{member5Name}</span></li>
                <li><label>กรรมการสำรอง (ภายนอก):</label> <span>{reserveExternalName}</span></li>
                <li><label>กรรมการสำรอง (ภายใน):</label> <span>{reserveInternalName}</span></li>
            </ul>
            <hr className={styles.subtleDivider} />

            <h4>เอกสารแนบ</h4>
            <ul className={styles.infoList}>
                {doc.files && doc.files.length > 0 ? (
                    doc.files.map((file, index) => (
                        <li key={index}>
                            <label>{file.type}:</label>
                            <a 
                                href={`${API_URL}${file.path}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={styles.fileLink}
                            >
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

export default Form2Detail;
