import React from 'react';
import styles from '../../pages/User_Page/DocumentDetailPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faBook, faTools } from '@fortawesome/free-solid-svg-icons';

// ✅ 1. เพิ่มฟังก์ชันสำหรับจัดรูปแบบวันที่
const formatSimpleDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Form5Detail({ doc, user }) {

    const details = doc.form_details || {};
    const researchTools = details.research_tools || [];

    return (
        <>
            <h4><FontAwesomeIcon icon={faUserGraduate} /> ข้อมูลผู้ยื่นคำร้อง</h4>
            <ul className={styles.infoList}>
                <li><label>ชื่อ-นามสกุล:</label> <span>{`${user.prefix_th} ${user.first_name_th} ${user.last_name_th}`}</span></li>
                <li><label>รหัสนักศึกษา:</label> <span>{user.student_id}</span></li>
                <li><label>หลักสูตร:</label> <span>{user.program_name || '-'}</span></li>
                <li><label>อีเมล:</label> <span>{user.email}</span></li>
                <li><label>เบอร์โทรศัพท์:</label> <span>{user.phone}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />
            
            <h4><FontAwesomeIcon icon={faBook} /> ข้อมูลหัวข้อวิทยานิพนธ์ (ที่ได้รับอนุมัติ)</h4>
            <ul className={styles.infoList}>
                {/* ✅ 2. เพิ่มการแสดงผลวันที่อนุมัติ */}
                <li><label>วันที่อนุมัติ:</label> <span>{formatSimpleDate(user.proposal_approval_date)}</span></li>
                <li><label>ภาษาไทย:</label> <span className={styles.thesisTitle}>{user.thesis_title_th || '-'}</span></li>
                <li><label>ภาษาอังกฤษ:</label> <span className={styles.thesisTitle}>{user.thesis_title_en || '-'}</span></li>
            </ul>

            <hr className={styles.subtleDivider} />

            <h4><FontAwesomeIcon icon={faTools} /> รายละเอียดการขออนุญาต</h4>
            <div className={styles.subsection}>
                <h5>เครื่องมือที่ใช้ในการวิจัย และจำนวนหนังสือที่ต้องการ</h5>
                <ul className={`${styles.infoList} ${styles.compact}`}>
                    {researchTools.length > 0 ? (
                        researchTools.map((item, index) => (
                            <li key={index}><label>{item.type}:</label> <span>{item.quantity} ฉบับ</span></li>
                        ))
                    ) : (
                        <li>ไม่มีข้อมูล</li>
                    )}
                </ul>
            </div>
        </>
    );
}

export default Form5Detail;