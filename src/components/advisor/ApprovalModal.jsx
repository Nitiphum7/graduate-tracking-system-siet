import React, { useState } from 'react';
import styles from './ApprovalModal.module.css'; // สร้างไฟล์ CSS ใหม่สำหรับ Modal

function ApprovalModal({ task, onClose, onSubmit }) {
    const [comment, setComment] = useState('');

    const handleAction = (status) => {
        // ส่ง status ('approved' หรือ 'rejected') และ comment กลับไป
        onSubmit(status, comment);
    };

    if (!task) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2>ดำเนินการเอกสาร</h2>
                <div className={styles.docInfo}>
                    <p><strong>เอกสาร:</strong> {task.document_title}</p>
                    <p><strong>นักศึกษา:</strong> {task.student_name}</p>
                </div>
                <textarea
                    className={styles.commentBox}
                    rows="4"
                    placeholder="เพิ่มความคิดเห็น (ถ้ามี)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className={styles.buttonGroup}>
                    <button 
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleAction('rejected')}
                    >
                        ตีกลับ / ไม่อนุมัติ
                    </button>
                    <button 
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleAction('approved')}
                    >
                        อนุมัติ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApprovalModal;