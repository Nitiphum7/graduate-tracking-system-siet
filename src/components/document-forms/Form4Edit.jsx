import React from 'react';

// ⭐ API_URL ถูกส่งมาจาก DocumentForm.jsx หลัก หรือกำหนดเอง (แต่ในฟอร์มนี้ไม่ได้ใช้)
const API_URL = 'http://localhost:3000'; 

function Form4Edit({ formData, initialData, handleChange, advisors, onEvaluatorChange, onAddEvaluator, onRemoveEvaluator }) {
    
    // ดึงข้อมูลหลักจาก props และป้องกัน null
    const details = initialData.form_details || {};
    const studentInfo = initialData; 

    // --- ส่วนแสดง Input สำหรับแก้ไขข้อมูลผู้ทรงคุณวุฒิ ---
    const renderEvaluatorInputs = () => {
        // ใช้ข้อมูล Evaluator จาก formData ถ้ามีการแก้ไขแล้ว หรือใช้จาก details.evaluators เดิม
        const evaluators = formData.evaluators || details.evaluators || [];

        if (evaluators.length === 0) {
            return <p style={{fontStyle: 'italic'}}>ไม่พบรายชื่อผู้ทรงคุณวุฒิที่เสนอชื่อไว้</p>;
        }
        
        return evaluators.map((evaluator, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>ข้อมูลผู้ทรงคุณวุฒิ คนที่ {index + 1}</h4>
                    <button type="button" onClick={() => onRemoveEvaluator(index)} 
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        ลบ
                    </button>
                </div>

                {/* 1. คำนำหน้า & สถาบัน (Editable) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label>คำนำหน้า/ยศ/ตำแหน่ง*</label>
                        <input type="text" value={evaluator.prefix || ''} required 
                               onChange={(e) => onEvaluatorChange(index, 'prefix', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                    <div>
                        <label>สถาบัน/หน่วยงาน*</label>
                        <input type="text" value={evaluator.affiliation || ''} required 
                               onChange={(e) => onEvaluatorChange(index, 'affiliation', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                </div>

                {/* 2. ชื่อ-นามสกุล (Editable) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                        <label>ชื่อ*</label>
                        <input type="text" value={evaluator.firstName || ''} required 
                               onChange={(e) => onEvaluatorChange(index, 'firstName', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                    <div>
                        <label>นามสกุล*</label>
                        <input type="text" value={evaluator.lastName || ''} required 
                               onChange={(e) => onEvaluatorChange(index, 'lastName', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                </div>
                
                {/* 3. โทรศัพท์ & อีเมล (Editable) */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                        <label>เบอร์โทรศัพท์*</label>
                        <input type="text" value={evaluator.phone || ''} required
                               onChange={(e) => onEvaluatorChange(index, 'phone', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                    <div>
                        <label>อีเมล*</label>
                        <input type="email" value={evaluator.email || ''} required
                               onChange={(e) => onEvaluatorChange(index, 'email', e.target.value)} 
                               style={{ width: '100%'}}/>
                    </div>
                </div>
            </div>
        ));
    };
    // --- สิ้นสุด renderEvaluatorInputs ---


    return (
        <>
            {/* -------------------------------------------------------- */}
            {/* 1. ข้อมูลนักศึกษาและวิทยานิพนธ์ (แสดงผลอย่างเดียว) */}
            {/* -------------------------------------------------------- */}
            <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>📌 ข้อมูลวิทยานิพนธ์</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label>หัวข้อ (ไทย):</label> <span>{details.student_info?.thesis_title_th || studentInfo.thesis_title_th || '-'}</span></div>
                    <div><label>วันที่อนุมัติเค้าโครง:</label> <span>{studentInfo.proposal_approval_date || '-'}</span></div>
                </div>
            </fieldset>

            {/* -------------------------------------------------------- */}
            {/* 2. รายละเอียดการขอเชิญ (แสดงผลอย่างเดียว) */}
            {/* -------------------------------------------------------- */}
            <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>ประเภทเครื่องมือที่ต้องการประเมิน</legend>
                <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                    {(details.document_types || []).map((doc, index) => (
                        <li key={index}>
                            {doc.type} ({doc.quantity} ฉบับ)
                        </li>
                    ))}
                </ul>
            </fieldset>

            {/* -------------------------------------------------------- */}
            {/* 3. ข้อมูลผู้ทรงคุณวุฒิ (เปิดให้แก้ไขและเพิ่ม/ลบได้) */}
            {/* -------------------------------------------------------- */}
            <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>👨‍🏫 ข้อมูลผู้ทรงคุณวุฒิ (แก้ไข/เพิ่มได้)</legend>
                
                {renderEvaluatorInputs()}

                {/* ปุ่มเพิ่มผู้ทรงคุณวุฒิ */}
                <button type="button" onClick={onAddEvaluator} 
                    style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                    + เพิ่มผู้ทรงคุณวุฒิใหม่
                </button>
            </fieldset>


            {/* -------------------------------------------------------- */}
            {/* 4. ส่วนความคิดเห็นเพิ่มเติม (ใช้ student_comment) */}
            {/* -------------------------------------------------------- */}
            <div className="form-group" style={{ marginBottom: '20px', marginTop: '20px' }}>
                <label htmlFor="student_comment_form4" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    💬 ความคิดเห็นเพิ่มเติม (ถึงผู้ตรวจสอบ/แอดมิน)
                </label>
                <textarea
                    id="student_comment_form4"
                    name="student_comment"
                    value={formData.student_comment || ''}
                    onChange={handleChange}
                    rows="4"
                    placeholder="ระบุข้อความเพื่อสื่อสารกับผู้ตรวจสอบ..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
        </>
    );
}


export default Form4Edit;