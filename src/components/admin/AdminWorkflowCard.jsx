import React from 'react';
import styles from './AdminWorkflowCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faListCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function AdminWorkflowCard({ document, onAction }) {

    const STATUS_ENUM = {
        WAITING_ADMIN_REVIEW: "รอตรวจสอบ",
        APPROVED: "อนุมัติ",
        REJECTED_FOR_EDIT: "ส่งกลับแก้ไข",
        REJECTED_PERMANENTLY: "ไม่อนุมัติ",
        PENDING_ADVISOR: "รออาจารย์ที่ปรึกษาอนุมัติ",
        PENDING_EXTERNAL_PROFESSOR: "รออาจารย์ภายนอกอนุมัติ",
        PENDING_EXAM_COMMITTEE: "รอคณะกรรมการสอบอนุมัติ",
        PENDING_EXAM_CHAIR: "รอประธานกรรมการสอบอนุมัติ",
        PENDING_RECTOR: "รอคณบดีอนุมัติ",
        PENDING_MAIN_ADVISOR: "รออาจารย์ที่ปรึกษาหลักอนุมัติ",
        PENDING_ADVISORS_3: "รออาจารย์ที่ปรึกษา (3 ท่าน) อนุมัติ",
        PENDING_STAFF_CONFIRM: "รอเจ้าหน้าที่ยืนยัน",
        PENDING_INTERNAL_RESERVE: "รออาจารย์สำรองภายในอนุมัติ",
        PENDING_EXTERNAL_RESERVE: "รออาจารย์สำรองภายนอกอนุมัติ",
        PENDING_PROGRAM_CHAIR: "รอประธานหลักสูตรอนุมัติ",
        PENDING_ASSISTANT_RECTOR: "รอผู้ช่วยคณบดีอนุมัติ",
    };

    const renderTimelineSteps = () => {
        const currentStatus = document.status;
        const s = STATUS_ENUM;
        
        let steps = [{
            title: 'นักศึกษายื่นเอกสาร',
            isCompleted: true
        }];

        const isStepCompleted = (completedStatuses) => {
            return completedStatuses.includes(currentStatus);
        }

        switch (document.document_type_id) {
            case 1: // Form 1: ขอแต่งตั้งอาจารย์ที่ปรึกษา (อันนี้เหมือนเดิม)
                steps.push(
                    { title: s.PENDING_ADVISOR, isCompleted: isStepCompleted([s.PENDING_RECTOR, s.PENDING_STAFF_CONFIRM, s.APPROVED]) },
                    { title: s.PENDING_RECTOR, isCompleted: isStepCompleted([s.PENDING_STAFF_CONFIRM, s.APPROVED]) },
                    { title: s.PENDING_STAFF_CONFIRM, isCompleted: isStepCompleted([s.APPROVED]) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            
            // --- 💡💡💡 จุดที่แก้ไข (ตามรูปวาด) 💡💡💡 ---
            case 2: // Form 2 & 6
            case 6:
                // สร้าง list สถานะที่ "ผ่านแล้ว" (Completed) ของแต่ละขั้น
                const completedForStaffConfirm = [s.APPROVED];
                const completedForRector = [s.PENDING_STAFF_CONFIRM, ...completedForStaffConfirm];
                const completedForAssistantRector = [s.PENDING_RECTOR, ...completedForRector];
                const completedForProgramChair = [s.PENDING_ASSISTANT_RECTOR, ...completedForAssistantRector];
                const completedForCommittee = [s.PENDING_PROGRAM_CHAIR, ...completedForProgramChair];
                const completedForAdvisor = [s.PENDING_EXAM_COMMITTEE, ...completedForCommittee];

                steps.push(
                    // 1. รออาจารย์ที่ปรึกษาอนุมัติ
                    { title: s.PENDING_ADVISOR, isCompleted: isStepCompleted(completedForAdvisor) },
                    
                    // 2. รอคณะกรรมการสอบอนุมัติ (ยุบรวม)
                    { title: s.PENDING_EXAM_COMMITTEE, isCompleted: isStepCompleted(completedForCommittee) },
                    
                    // 3. รอประธานหลักสูตรอนุมัติ
                    { title: s.PENDING_PROGRAM_CHAIR, isCompleted: isStepCompleted(completedForProgramChair) },
                    
                    // 4. รอผู้ช่วยคณบดีอนุมัติ
                    { title: s.PENDING_ASSISTANT_RECTOR, isCompleted: isStepCompleted(completedForAssistantRector) },
                    
                    // 5. รอคณบดีอนุมัติ
                    { title: s.PENDING_RECTOR, isCompleted: isStepCompleted(completedForRector) },
                    
                    // 6. รอเจ้าหน้าที่ยืนยัน
                    { title: s.PENDING_STAFF_CONFIRM, isCompleted: isStepCompleted(completedForStaffConfirm) },
                    
                    // 7. เสร็จสิ้น
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
            // --- 💡💡💡 สิ้นสุดจุดที่แก้ไข 💡💡💡 ---

            case 3: // Form 3 (อันนี้ผมแก้ให้ด้วยเลย)
                const completedForStaff_F3 = [s.APPROVED];
                const completedForExamChair_F3 = [s.PENDING_STAFF_CONFIRM, ...completedForStaff_F3];
                const completedForAdvisor_F3 = [s.PENDING_EXAM_CHAIR, ...completedForExamChair_F3];
                
                steps.push(
                    { title: s.PENDING_ADVISOR, isCompleted: isStepCompleted(completedForAdvisor_F3) },
                    { title: s.PENDING_EXAM_CHAIR, isCompleted: isStepCompleted(completedForExamChair_F3) },
                    { title: s.PENDING_STAFF_CONFIRM, isCompleted: isStepCompleted(completedForStaff_F3) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
                
            case 4: // Form 4
                steps.push(
                    { title: s.PENDING_MAIN_ADVISOR, isCompleted: isStepCompleted([s.PENDING_EXTERNAL_PROFESSOR, s.PENDING_STAFF_CONFIRM, s.APPROVED]) },
                    { title: s.PENDING_EXTERNAL_PROFESSOR, isCompleted: isStepCompleted([s.PENDING_STAFF_CONFIRM, s.APPROVED]) },
                    { title: s.PENDING_STAFF_CONFIRM, isCompleted: isStepCompleted([s.APPROVED]) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
                
            case 5: // Form 5
                steps.push(
                    { title: s.PENDING_MAIN_ADVISOR, isCompleted: isStepCompleted([s.PENDING_STAFF_CONFIRM, s.APPROVED]) },
                    { title: s.PENDING_STAFF_CONFIRM, isCompleted: isStepCompleted([s.APPROVED]) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;

            case 7: // English/QE Forms
            case 8:
            case 9:
                steps.push(
                    { title: 'เจ้าหน้าที่ตรวจสอบและอนุมัติ', isCompleted: isStepCompleted([s.APPROVED]) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
                break;
                
            default: // Workflow เริ่มต้นสำหรับฟอร์มที่ไม่ได้ระบุ
                steps.push(
                    { title: 'เจ้าหน้าที่ตรวจสอบ', isCompleted: isStepCompleted([s.APPROVED]) },
                    { title: 'เสร็จสิ้น', isCompleted: currentStatus === s.APPROVED }
                );
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

    // --------------------------------------------------------------------
    // ‼️ ส่วน renderActions นี้ "ไม่ต้องแก้ไข" ‼️
    // เพราะ Logic การส่งต่อ (Forward) ของ Admin ยังถูกต้องเหมือนเดิม
    // (คือ Admin ส่งให้ "รออาจารย์ที่ปรึกษาอนุมัติ" เป็นขั้นตอนแรก)
    // --------------------------------------------------------------------
    const renderActions = () => {
        const currentStatus = document.status;
        const s = STATUS_ENUM;

        const actionableAdminStatuses = [s.WAITING_ADMIN_REVIEW, s.PENDING_STAFF_CONFIRM];

        if (!actionableAdminStatuses.includes(currentStatus)) {
            let statusMessage = `สถานะปัจจุบัน: ${currentStatus}`;
            if (currentStatus === s.APPROVED) statusMessage = 'เอกสารนี้ดำเนินการเสร็จสิ้นและอนุมัติแล้ว';
            if (currentStatus === s.REJECTED_FOR_EDIT) statusMessage = 'เอกสารถูกส่งกลับไปให้นักศึกษาแก้ไข';
            return <div className={styles.actionBody}><p className={styles.waitingInfo}>{statusMessage}</p></div>;
        }

        let targetStatusForForward;
        let nextStepText;

        if (currentStatus === s.WAITING_ADMIN_REVIEW) {
            switch (document.document_type_id) {
                case 1:
                case 2:
                case 6:
                case 3: targetStatusForForward = s.PENDING_ADVISOR; break;
                
                case 4:
                case 5: targetStatusForForward = s.PENDING_MAIN_ADVISOR; break;
                
                case 7:
                case 8:
                case 9:
                default: targetStatusForForward = s.APPROVED; break;
            }
            nextStepText = targetStatusForForward === s.APPROVED ? "ตรวจสอบและอนุมัติ" : `ส่งต่อให้ "${targetStatusForForward}"`;
        } 
        
        else if (currentStatus === s.PENDING_STAFF_CONFIRM) {
            targetStatusForForward = s.APPROVED;
            nextStepText = "ยืนยันและอนุมัติ (ขั้นตอนสุดท้าย)";
        }

        const handleReject = () => {
            const reason = prompt("กรุณาใส่เหตุผลในการส่งกลับแก้ไข:");
            if (reason) {
                onAction(s.REJECTED_FOR_EDIT, reason);
            }
        };

        return (
            <div className={styles.actionBody}>
                <p className={styles.nextStepInfo}><b>ขั้นตอนต่อไป:</b> {nextStepText}</p>
                <div className={styles.actionButtons}>
                    <button onClick={() => onAction(targetStatusForForward)} className={styles.primaryButton}>
                        <FontAwesomeIcon icon={faPaperPlane} /> {targetStatusForForward === s.APPROVED ? 'อนุมัติ' : 'ส่งต่อ'}
                    </button>
                    <button onClick={handleReject} className={styles.dangerButton}>
                        ส่งกลับให้แก้ไข
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.header}>
                <FontAwesomeIcon icon={faListCheck} /> สถานะของเอกสาร
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