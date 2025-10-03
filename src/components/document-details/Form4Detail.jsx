import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faBook, faUserTie, faUsers } from '@fortawesome/free-solid-svg-icons';

function Form4Detail({ doc, user, advisors }) { // ✅ 1. ลด Props ที่ไม่จำเป็นออก

    const findAdvisorName = (advisorId) => {
        if (!advisorId || !advisors || advisors.length === 0) return '-';
        const advisor = advisors.find(a => 
            String(a.advisor_id) === String(advisorId) || 
            String(a.id) === String(advisorId)
        );
        return advisor ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() : 'ไม่พบข้อมูล';
    };

    // ✅ 2. อ่านข้อมูลรายละเอียดจาก doc.form_details
    const details = doc.form_details || {};
    const documentTypes = details.document_types || [];
    const evaluators = details.evaluators || [];

    // ✅ 3. ค้นหาชื่ออาจารย์ที่ปรึกษาหลักโดยใช้ prop 'user' และ 'advisors'
    const mainAdvisorName = findAdvisorName(user.main_advisor_id);

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่นคำร้อง</h4>
            <ul className={styles.infoList}>
                 {/* ✅ 4. อ่านข้อมูลโปรไฟล์จาก prop 'user' โดยตรง */}
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                <li><label>หลักสูตร:</label> <span>{user.program_name}</span></li>
                <li><label>ภาควิชา:</label> <span>{user.department_name}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faBook} /> ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
            <ul className={styles.infoList}>
                <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{user.thesis_title_th || '-'}</span></li>
                <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{user.thesis_title_en || '-'}</span></li>
            </ul>
            
            <hr className={styles.subtleDivider} />
            <h4><FontAwesomeIcon icon={faUserTie} /> ข้อมูลอาจารย์ที่ปรึกษาหลัก</h4>
            <div className={styles.subsection}>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    <li><label>ชื่อ-นามสกุล:</label> <span>{mainAdvisorName}</span></li>
                </ul>
            </div>

            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faUsers} /> รายละเอียดการขอเชิญ</h4>
            <div className={styles.subsection}>
                <h5>ประเภทเครื่องมือที่ต้องการประเมิน</h5>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {documentTypes.length > 0 ? (
                        documentTypes.map((item, index) => (
                            <li key={index}><label>{item.type}:</label> <span>{item.quantity} ฉบับ</span></li>
                        ))
                    ) : ( <li>ไม่มีข้อมูล</li> )}
                </ul>
            </div>
            <div className={styles.subsection}>
                <h5>รายชื่อผู้ทรงคุณวุฒิที่เสนอเชิญ</h5>
                {evaluators.length > 0 ? (
                    evaluators.map((evaluator, index) => (
                        <div key={index} className={styles.evaluatorDetailCard}>
                            <h6>ผู้ทรงคุณวุฒิคนที่ {index + 1}</h6>
                            <ul className={`${styles.infoList} ${styles.compact}`}>
                                <li><label>คำนำหน้า/ยศ/ตำแหน่ง:</label> <span>{evaluator.prefix}</span></li>
                                <li><label>ชื่อ-สกุล:</label> <span>{`${evaluator.firstName} ${evaluator.lastName}`}</span></li>
                                <li><label>สถาบัน/หน่วยงาน:</label> <span>{evaluator.affiliation}</span></li>
                            </ul>
                        </div>
                    ))
                ) : ( <p>ไม่มีข้อมูล</p> )}
            </div>
        </>
    );
}

export default Form4Detail;