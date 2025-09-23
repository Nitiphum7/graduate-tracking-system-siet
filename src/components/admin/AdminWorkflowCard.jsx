import React from 'react';
import styles from './AdminWorkflowCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faListCheck } from '@fortawesome/free-solid-svg-icons';

function AdminWorkflowCard({ document, onAction }) {

    const STATUS_ENUM = {
        WAITING_ADMIN_REVIEW: 'รอตรวจสอบ',
        APPROVED: 'อนุมัติ',
        REJECTED: 'ส่งกลับแก้ไข',
        PENDING_ADVISOR: 'รออาจารย์ที่ปรึกษาอนุมัติ',
        PENDING_RECTOR: 'รออธิการบดีอนุมัติ',
        PENDING_STAFF_REVIEW: 'รอเจ้าหน้าที่ตรวจสอบ',
        PENDING_ADVISORS_3: 'รออาจารย์ที่ปรึกษา (3 ท่าน) อนุมัติ',
        PENDING_EXAM_CHAIR: 'รอประธานกรรมการสอบอนุมัติ',
        PENDING_EXAM_COMMITTEE: 'รอคณะกรรมการสอบอนุมัติ',
        PENDING_INTERNAL_RESERVE: 'รออาจารย์สำรองภายในอนุมัติ',
        PENDING_EXTERNAL_RESERVE: 'รออาจารย์สำรองภายนอกอนุมัติ',
        PENDING_PROGRAM_CHAIR: 'รอประธานหลักสูตรอนุมัติ',
        PENDING_ASSISTANT_RECTOR: 'รอผู้ช่วยอธิการบดีอนุมัติ',
        PENDING_MAIN_ADVISOR: 'รออาจารย์ที่ปรึกษาหลักอนุมัติ',
        PENDING_EXTERNAL_PROFESSOR: 'รออาจารย์ภายนอกอนุมัติ',
    };

    const renderTimelineSteps = () => {
        const currentStatus = document.status;
        const s = STATUS_ENUM;

        let steps = [{
            title: 'นักศึกษายื่นเอกสาร',
            actor: `โดย: ${document.prefix_th || ''}${document.first_name_th || ''} ${document.last_name_th || ''}`.trim(),
            isCompleted: true
        }];
        
        switch (document.document_type_id) {
            case 1: // Form 1
                steps.push(
                    { title: 'อาจารย์ที่ปรึกษาอนุมัติ', isCompleted: [s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'อธิการบดีอนุมัติ', isCompleted: [s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            case 2: // Form 2 & 6
            case 6:
                steps.push(
                    { title: 'อาจารย์ที่ปรึกษา (3 ท่าน) อนุมัติ', isCompleted: ![s.WAITING_ADMIN_REVIEW, s.PENDING_ADVISORS_3].includes(currentStatus) && currentStatus !== s.REJECTED },
                    { title: 'ประธานกรรมการสอบอนุมัติ', isCompleted: [s.PENDING_EXAM_COMMITTEE, s.PENDING_INTERNAL_RESERVE, s.PENDING_EXTERNAL_RESERVE, s.PENDING_PROGRAM_CHAIR, s.PENDING_ASSISTANT_RECTOR, s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'คณะกรรมการสอบอนุมัติ', isCompleted: [s.PENDING_INTERNAL_RESERVE, s.PENDING_EXTERNAL_RESERVE, s.PENDING_PROGRAM_CHAIR, s.PENDING_ASSISTANT_RECTOR, s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'อาจารย์สำรองภายในอนุมัติ', isCompleted: [s.PENDING_EXTERNAL_RESERVE, s.PENDING_PROGRAM_CHAIR, s.PENDING_ASSISTANT_RECTOR, s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'อาจารย์สำรองภายนอกอนุมัติ', isCompleted: [s.PENDING_PROGRAM_CHAIR, s.PENDING_ASSISTANT_RECTOR, s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'ประธานหลักสูตรอนุมัติ', isCompleted: [s.PENDING_ASSISTANT_RECTOR, s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'ผู้ช่วยอธิการบดีอนุมัติ', isCompleted: [s.PENDING_RECTOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'อธิการบดีอนุมัติ', isCompleted: [s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            case 3: // Form 3
                steps.push(
                    { title: 'อาจารย์ที่ปรึกษา (3 ท่าน) อนุมัติ', isCompleted: [s.PENDING_EXAM_CHAIR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'ประธานกรรมการสอบอนุมัติ', isCompleted: [s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            case 4: // Form 4
                steps.push(
                    { title: 'อาจารย์ที่ปรึกษาหลักอนุมัติ', isCompleted: [s.PENDING_EXTERNAL_PROFESSOR, s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'อาจารย์ภายนอกอนุมัติ', isCompleted: [s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            case 5: // Form 5
                steps.push(
                    { title: 'อาจารย์ที่ปรึกษาหลักอนุมัติ', isCompleted: [s.PENDING_STAFF_REVIEW, s.APPROVED].includes(currentStatus) },
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            case 7: // English Forms
            case 8:
            case 9:
                steps.push(
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            default:
                steps.push({ title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: currentStatus === s.APPROVED });
                steps.push({ title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED });
                break;
        }
        
        const activeIndex = steps.findIndex(step => !step.isCompleted);

        return steps.map((step, index) => {
            const isCompleted = step.isCompleted;
            const isActive = activeIndex !== -1 && index === activeIndex;
            return (
                <li key={index} className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}>
                    <div className={styles.icon}>
                        <FontAwesomeIcon icon={isCompleted ? faCheck : (isActive ? faListCheck : faClock)} />
                    </div>
                    <div className={styles.details}>
                        <span className={styles.title}>{step.title}</span>
                        {step.actor && <span className={styles.actor}>{step.actor}</span>}
                    </div>
                </li>
            );
        });
    };

    const renderActions = () => {
        const currentStatus = document.status;
        const docTypeId = document.document_type_id;
        const s = STATUS_ENUM;

        if (currentStatus !== s.WAITING_ADMIN_REVIEW) {
            let statusMessage = `สถานะปัจจุบัน: ${currentStatus}`;
            if (currentStatus === s.APPROVED) statusMessage = 'เอกสารนี้ดำเนินการเสร็จสิ้นและอนุมัติแล้ว';
            if (currentStatus === s.REJECTED) statusMessage = 'เอกสารถูกส่งกลับไปให้นักศึกษาแก้ไข';
            return <div className={styles.actionBody}><p className={styles.waitingInfo}>{statusMessage}</p></div>;
        }

        let targetStatusForForward;
        let nextStepText;

        switch (docTypeId) {
            case 1:
                targetStatusForForward = s.PENDING_ADVISOR;
                nextStepText = "ส่งต่อให้อาจารย์ที่ปรึกษาอนุมัติ";
                break;
            case 2:
            case 6:
                targetStatusForForward = s.PENDING_ADVISORS_3;
                nextStepText = "ส่งต่อให้อาจารย์ที่ปรึกษาทั้ง 3 ท่านอนุมัติ";
                break;
            case 3:
                targetStatusForForward = s.PENDING_ADVISORS_3;
                nextStepText = "ส่งต่อให้อาจารย์ที่ปรึกษาทั้ง 3 ท่านอนุมัติ";
                break;
            case 4:
                targetStatusForForward = s.PENDING_MAIN_ADVISOR;
                nextStepText = "ส่งต่อให้อาจารย์ที่ปรึกษาหลักอนุมัติ";
                break;
            case 5:
                targetStatusForForward = s.PENDING_MAIN_ADVISOR;
                nextStepText = "ส่งต่อให้อาจารย์ที่ปรึกษาหลักอนุมัติ";
                break;
            case 7:
            case 8:
            case 9:
                targetStatusForForward = s.PENDING_STAFF_REVIEW;
                nextStepText = "ส่งให้เจ้าหน้าที่ตรวจสอบ";
                 break;
            default:
                targetStatusForForward = s.APPROVED;
                nextStepText = "ตรวจสอบและอนุมัติ";
        }
        
        if (targetStatusForForward === s.APPROVED || targetStatusForForward === s.PENDING_STAFF_REVIEW) {
            return (
                <div className={styles.actionBody}>
                    <p><b>ขั้นตอนต่อไป:</b> {nextStepText}</p>
                    <div className={styles.actionButtons}>
                        <button onClick={() => onAction(targetStatusForForward)} className={styles.primaryButton}>{docTypeId >= 7 ? 'ยืนยัน' : 'อนุมัติ'}</button>
                        <button onClick={() => { const reason = prompt("เหตุผล:"); if (reason) onAction(s.REJECTED, reason); }} className={styles.dangerButton}>ส่งกลับแก้ไข</button>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.actionBody}>
                <p className={styles.nextStepInfo}><b>ขั้นตอนต่อไป:</b> {nextStepText}</p>
                <div className={styles.actionButtons}>
                    <button onClick={() => onAction(targetStatusForForward)} className={styles.primaryButton}>ส่งต่อ</button>
                    <button onClick={() => {
                        const reason = prompt("กรุณาใส่เหตุผลในการส่งกลับ:");
                        if (reason) { onAction(s.REJECTED, reason); }
                    }} className={styles.dangerButton}>
                        ส่งกลับให้แก้ไข
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.header}>
                <FontAwesomeIcon icon={faListCheck} /> ดำเนินการและสถานะ Workflow
            </h3>
            <div className={styles.timelineWrapper}>
                <ul className={styles.timeline}>
                    {renderTimelineSteps()}
                </ul>
            </div>
            <hr className={styles.divider} />
            {renderActions()}
        </div>
    );
}

export default AdminWorkflowCard;

