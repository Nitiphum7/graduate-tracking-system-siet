import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

// Component นี้จะฉลาดน้อยลง และทำหน้าที่แค่แสดงผลข้อมูลที่ได้รับมา
function Form1Detail({ doc, user, advisors }) {

  // ฟังก์ชันสำหรับหาชื่ออาจารย์จาก ID ใน list ที่ได้รับมา
  const findAdvisorName = (advisorId) => {
    // ป้องกัน Error ถ้าไม่มี advisors list หรือไม่มี advisorId
    if (!advisorId || !advisors) return '-';
    
    const advisor = advisors.find(a => a.advisor_id === advisorId);
    return advisor 
      ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() 
      : 'ไม่พบข้อมูลอาจารย์';
  };

  return (
    <>
      <h4>ข้อมูลผู้ยื่นคำร้อง</h4>
      <ul className={styles.infoList}>
        {/* ใช้ข้อมูลจาก props 'user' ที่มีข้อมูลครบถ้วนอยู่แล้ว */}
        <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
        <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
        <li><label>หลักสูตร:</label> <span>{user.program_name}</span></li>
        <li><label>ภาควิชา:</label> <span>{user.department_name}</span></li>
      </ul>
      <hr className={styles.subtleDivider} />
      <h4>อาจารย์ที่ปรึกษาที่เลือก</h4>
      <ul className={styles.infoList}>
        {/* ใช้ข้อมูลจาก props 'doc' ซึ่งมีข้อมูล advisor id อยู่ */}
        <li><label>ที่ปรึกษาหลัก:</label> <span>{findAdvisorName(doc.main_advisor_id)}</span></li>
        <li><label>ที่ปรึกษาร่วม:</label> <span>{findAdvisorName(doc.co_advisor_id)}</span></li>
      </ul>
    </>
  );
}

export default Form1Detail;