import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';

function Form1Detail({ doc, user, advisors }) {

  const findAdvisorName = (advisorId) => {
    if (!advisorId || !advisors || advisors.length === 0) {
      return '-';
    }
    
    // ใช้ Logic การค้นหาที่ฉลาดที่สุดจากเวอร์ชันฝั่ง Student
    const advisor = advisors.find(a => 
        String(a.advisor_id) === String(advisorId) || 
        String(a.id) === String(advisorId)
    );
    
    return advisor 
      ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() 
      : 'ไม่พบข้อมูลอาจารย์';
  };

  
  const mainAdvisorId = doc.form_details?.main_advisor_id || doc.main_advisor_id;
  const coAdvisorId = doc.form_details?.co_advisor_id || doc.co_advisor_id;

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
      <h4>อาจารย์ที่ปรึกษาที่เลือก</h4>
      <ul className={styles.infoList}>
        <li><label>ที่ปรึกษาหลัก:</label> <span>{findAdvisorName(mainAdvisorId)}</span></li>
        <li><label>ที่ปรึกษาร่วม:</label> <span>{findAdvisorName(coAdvisorId)}</span></li>
      </ul>
    </>
  );
}

export default Form1Detail;