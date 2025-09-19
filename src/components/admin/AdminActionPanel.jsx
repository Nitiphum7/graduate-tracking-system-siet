import React from 'react';
import styles from './AdminActionPanel.module.css';

function AdminActionPanel({ document, onAction }) {
  
  // ตรวจสอบก่อนว่า document มีข้อมูลหรือไม่ เพื่อป้องกัน error
  if (!document) {
    return (
      <div className={styles.actionCard}>
        <h3>การดำเนินการ</h3>
        <div className={styles.actionBody}>
          <p className={styles.waitingInfo}>กำลังรอข้อมูลเอกสาร...</p>
        </div>
      </div>
    );
  }

  const renderActions = () => {
    // ✅✅✅ แก้ไข: ใช้ .status_name ให้ตรงกับข้อมูลจาก API
    switch (document.status_name) {
      case 'รอตรวจ':
        return (
          <div className={styles.actionBody}>
            <p className={styles.actionInfo}>
              <b>ขั้นตอนต่อไป:</b> ส่งต่อเอกสารให้ผู้เกี่ยวข้องอนุมัติ
            </p>
            <div className={styles.actionButtons}>
              <button onClick={() => onAction('ส่งต่อ')} className={styles.primaryButton}>ส่งต่อ</button>
              <button 
                onClick={() => {
                    const reason = prompt("กรุณาใส่เหตุผลในการส่งกลับ (ถ้ามี):");
                    if (reason !== null) { 
                      onAction('ส่งกลับแก้ไข', reason);
                    }
                }} 
                className={styles.dangerButton}
              >
                ส่งกลับแก้ไข
              </button>
            </div>
          </div>
        );
      case 'รออาจารย์อนุมัติ':
        const pendingCount = document.approvers?.filter(a => a.status === 'pending').length || 0;
        return (
          <div className={styles.actionBody}>
            <p className={styles.waitingInfo}>กำลังรอการอนุมัติจากกรรมการ {pendingCount} ท่าน...</p>
          </div>
        );
      default:
        return (
          <div className={styles.actionBody}>
            <p className={styles.waitingInfo}>สถานะปัจจุบัน: {document.status_name}</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.actionCard}>
      <h3>การดำเนินการ</h3>
      {renderActions()}
    </div>
  );
}
export default AdminActionPanel;