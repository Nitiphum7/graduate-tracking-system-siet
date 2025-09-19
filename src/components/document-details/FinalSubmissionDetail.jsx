import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID
const findAdvisorName = (id, advisors) => {
  if (!id || !advisors) return '-';
  const advisor = advisors.find(a => a.advisor_id === id);
  return advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'ไม่พบข้อมูล';
};

// Component นี้จะแสดงข้อมูลสรุปทั้งหมดโดยดึงจากโปรไฟล์ล่าสุด
function FinalSubmissionDetail({ doc, user, advisors, studentProfile }) {

  // ใช้ optional chaining (?.) เพื่อป้องกัน Error หาก studentProfile ยังไม่มีข้อมูล
  const mainAdvisorName = findAdvisorName(studentProfile?.main_advisor_id, advisors);
  const coAdvisor1Name = findAdvisorName(studentProfile?.co_advisor1_id, advisors);
  const coAdvisor2Name = findAdvisorName(studentProfile?.co_advisor2_id, advisors);
  const programChairName = findAdvisorName(studentProfile?.proposal_chair_id, advisors);

  return (
    <>
      <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
      <ul className={styles.infoList}>
        <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{user.program_name}</span></li>
        <li><label>ภาควิชา:</label> <span>{user.department_name}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />
      
      <h4>ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
      <ul className={styles.infoList}>
        <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{studentProfile?.thesis_title_th || '-'}</span></li>
        <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{studentProfile?.thesis_title_en || '-'}</span></li>
      </ul>

      <hr className={styles.subtleDivider} />

      <h4>อาจารย์ผู้รับผิดชอบ</h4>
      <div className={styles.subsection}>
        <ul className={`${styles.infoList} ${styles.compact}`}>
            <li><label>ประธานกรรมการสอบ:</label> <span>{programChairName}</span></li>
            <li><label>อาจารย์ที่ปรึกษาหลัก:</label> <span>{mainAdvisorName}</span></li>
            <li><label>อาจารย์ที่ปรึกษาร่วม 1:</label> <span>{coAdvisor1Name}</span></li>
            <li><label>อาจารย์ที่ปรึกษาร่วม 2:</label> <span>{coAdvisor2Name}</span></li>
        </ul>
      </div>

      {/* ส่วนนี้จะแสดงไฟล์แนบ หากเอกสารนี้มีการแนบไฟล์มาด้วย */}
      {doc.files && doc.files.length > 0 && (
        <>
            <hr className={styles.subtleDivider} />
            <h4>เอกสารแนบ</h4>
            <ul className={styles.infoList}>
                {doc.files.map((file, index) => (
                    <li key={index}>
                        <label>{file.type}:</label>
                        <a href="#" onClick={(e) => e.preventDefault()} className={styles.fileLink}>
                            {file.name}
                        </a>
                    </li>
                ))}
            </ul>
        </>
      )}
    </>
  );
}

export default FinalSubmissionDetail;