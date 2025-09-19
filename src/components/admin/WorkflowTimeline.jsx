import React from 'react';
import styles from './WorkflowTimeline.module.css';

function WorkflowTimeline({ document, advisors }) {

  const renderTimelineSteps = () => {
    // --- ✅ 1. แก้ไขเงื่อนไขให้ตรวจสอบว่าเป็น Array จริงๆ หรือไม่ ---
    // ใช้ Array.isArray() เพื่อป้องกัน Error เมื่อ document.approvers ไม่มีอยู่จริง หรือไม่ใช่ Array
    if (!Array.isArray(document.approvers) || document.approvers.length === 0) {
      return (
        <li className={styles.step}>
          <span className={styles.stepRole}>- ไม่มีขั้นตอนต่อไป -</span>
        </li>
      );
    }

    // ส่วนนี้จะทำงานก็ต่อเมื่อ document.approvers เป็น Array ที่มีข้อมูลเท่านั้น
    return document.approvers.map(approver => {
      const advisor = advisors.find(a => a.advisor_id === approver.advisor_id);
      const advisorName = advisor ? `${advisor.prefix_th}${advisor.first_name_th} ${advisor.last_name_th}`.trim() : 'N/A';
      const isApproved = approver.status === 'approved';

      return (
        <li key={approver.advisor_id} className={`${styles.step} ${isApproved ? styles.approved : ''}`}>
          <span className={styles.stepRole}>{isApproved ? 'อนุมัติโดย' : 'รออนุมัติโดย'}: {approver.role}</span>
          <span className={styles.stepName}>{advisorName}</span>
        </li>
      );
    });
  };

  if (!document) {
      return <div>กำลังโหลดข้อมูล Timeline...</div>;
  }

  return (
    <div className={styles.timelineCard}>
      <h4>ขั้นตอนการดำเนินงาน</h4>
      <ul className={styles.timelineList}>
        {/* ขั้นตอนแรก: ผู้ยื่นเอกสาร */}
        <li className={`${styles.step} ${styles.approved}`}>
            <span className={styles.stepRole}>ยื่นเอกสาร</span>
            {/* ดึงชื่อนักศึกษาจาก prop 'document' ที่ได้รับข้อมูล join มาแล้ว */}
            <span>ดำเนินการโดย: {`${document.prefix_th} ${document.first_name_th} ${document.last_name_th}`.trim()}</span>
        </li>
        
        {/* ขั้นตอนต่อไป: รายชื่ออาจารย์ */}
        {renderTimelineSteps()}
      </ul>
    </div>
  );
}

export default WorkflowTimeline;
