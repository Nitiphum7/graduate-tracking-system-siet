import React from 'react';
// ⭐ นำเข้า Font Awesome กลับมา ⭐
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

// Base URL ของ Backend ที่เสิร์ฟไฟล์
const SERVER_BASE_URL = 'http://localhost:3000'; 

// ⭐ แก้ไข: กำหนดชื่อ Field, Label, และ DB Type ที่ถูกต้อง ⭐
const requiredFileFields = [
    // [field]: ใช้สำหรับ Input/Backend | [dbType]: ใช้สำหรับค้นหาไฟล์เก่าใน initialData.files (ชื่อไทยเต็ม)
    { field: 'thesisDraftFile', label: '1. วิทยานิพนธ์ฉบับสมบูรณ์', dbType: 'วิทยานิพนธ์ฉบับสมบูรณ์' },
    { field: 'abstractThFile', label: '2. บทคัดย่อ (ภาษาไทย)', dbType: 'บทคัดย่อ (ภาษาไทย)' },
    { field: 'abstractEnFile', label: '3. บทคัดย่อ (ภาษาอังกฤษ)*', dbType: 'บทคัดย่อ (ภาษาอังกฤษ)' },
    { field: 'tocThFile', label: '4. สารบัญฯ (ภาษาไทย)', dbType: 'สารบัญฯ (ภาษาไทย)' },
    { field: 'tocEnFile', label: '5. สารบัญฯ (ภาษาอังกฤษ)', dbType: 'สารบัญฯ (ภาษาอังกฤษ)' },
    { field: 'publicationProofFile', label: '6. หลักฐานการตอบรับการตีพิมพ์/นำเสนอผลงาน', dbType: 'หลักฐานการตอบรับการตีพิมพ์/นำเสนอผลงาน' },
    { field: 'gradeCheckProofFile', label: '7. หลักฐานการตรวจสอบผลการเรียน', dbType: 'หลักฐานการตรวจสอบผลการเรียน' },
];

function Form6Edit({ formData, initialData, handleChange, handleFileChange, newFiles, advisors }) {
    
    const details = initialData.form_details || {};
    const committee = details.committee || {};
    const studentInfo = initialData;
    
    // สร้าง Array ของไฟล์เพื่อให้ find() ใช้งานได้เสมอ ป้องกัน TypeError
    const filesArray = Array.isArray(initialData.files) ? initialData.files : []; 

    // ฟังก์ชันสำหรับค้นหาชื่ออาจารย์
    const findAdvisorName = (advisorId) => {
        if (!advisorId || !advisors || advisors.length === 0) return '-';
        const advisor = advisors.find(a => String(a.advisor_id) === String(advisorId));
        return advisor ? `${advisor.prefix_th || ''}${advisor.first_name_th || ''} ${advisor.last_name_th || ''}`.trim() : 'ไม่พบข้อมูลอาจารย์';
    };
    
    const fullAdvisorOptions = advisors || [];

    // ดึงข้อมูลคณะกรรมการจาก State (ที่ถูกโหลดมาใน DocumentForm.jsx)
    const currentChair = formData.committeeChair || committee.chair_id;
    const currentCoAdvisor2 = formData.coAdvisor2 || committee.co_advisor2_id;
    const currentMember5 = formData.committeeMember5 || committee.member5_id;
    const currentReserveExternal = formData.reserveExternal || committee.reserve_external_id;
    const currentReserveInternal = formData.reserveInternal || committee.reserve_internal_id;


    return (
        <>
            {/* -------------------------------------------------------- */}
            {/* 1. คณะกรรมการสอบ (Editable) */}
            {/* -------------------------------------------------------- */}
            <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>👨‍🏫 คณะกรรมการสอบ (แก้ไขได้)</legend>
                
                {/* ประธานกรรมการสอบ */}
                <div style={{ marginBottom: '10px' }}>
                    <label>ประธานกรรมการสอบ*</label>
                    <select name="committeeChair" value={currentChair} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- กรุณาเลือก --</option>
                        {fullAdvisorOptions.map(adv => <option key={`chair-${adv.advisor_id}`} value={adv.advisor_id}>{findAdvisorName(adv.advisor_id)}</option>)}
                    </select>
                </div>
                {/* กรรมการ (ที่ปรึกษาร่วม 2) */}
                <div style={{ marginBottom: '10px' }}>
                    <label>กรรมการ (ที่ปรึกษาร่วม 2)*</label>
                    <select name="coAdvisor2" value={currentCoAdvisor2} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- กรุณาเลือก --</option>
                        {fullAdvisorOptions.map(adv => <option key={`co2-${adv.advisor_id}`} value={adv.advisor_id}>{findAdvisorName(adv.advisor_id)}</option>)}
                    </select>
                </div>
                {/* กรรมการสอบ (คนที่ 5) */}
                <div style={{ marginBottom: '10px' }}>
                    <label>กรรมการสอบ (คนที่ 5)*</label>
                    <select name="committeeMember5" value={currentMember5} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- กรุณาเลือก --</option>
                        {fullAdvisorOptions.map(adv => <option key={`mem5-${adv.advisor_id}`} value={adv.advisor_id}>{findAdvisorName(adv.advisor_id)}</option>)}
                    </select>
                </div>
                {/* กรรมการสำรอง (ภายนอก) */}
                <div style={{ marginBottom: '10px' }}>
                    <label>กรรมการสำรอง (ภายนอก)*</label>
                    <select name="reserveExternal" value={currentReserveExternal} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- กรุณาเลือก --</option>
                        {fullAdvisorOptions.map(adv => <option key={`resE-${adv.advisor_id}`} value={adv.advisor_id}>{findAdvisorName(adv.advisor_id)}</option>)}
                    </select>
                </div>
                {/* กรรมการสำรอง (ภายใน) */}
                <div style={{ marginBottom: '10px' }}>
                    <label>กรรมการสำรอง (ภายใน)*</label>
                    <select name="reserveInternal" value={currentReserveInternal} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
                        <option value="">-- กรุณาเลือก --</option>
                        {fullAdvisorOptions.map(adv => <option key={`resI-${adv.advisor_id}`} value={adv.advisor_id}>{findAdvisorName(adv.advisor_id)}</option>)}
                    </select>
                </div>

            </fieldset>

            {/* -------------------------------------------------------- */}
            {/* 3. ไฟล์แนบ (หลายไฟล์) - แก้ไข Logic การค้นหา */}
            {/* -------------------------------------------------------- */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>📎 ไฟล์แนบ (อัปโหลดใหม่เพื่อแทนที่)</label>

                {requiredFileFields.map((fileDef) => {
                    // ⭐ [แก้ไขที่นี่] ค้นหาไฟล์เก่าโดยใช้ค่า dbType (ชื่อไทยเต็ม)
                    const currentFile = filesArray.find(f => f.type === fileDef.dbType); // <--- ใช้ dbType
                    
                    const isNewFileSelected = newFiles[fileDef.field]; 
                    const fileToDisplay = isNewFileSelected ? newFiles[fileDef.field] : currentFile;
                    
                    const inputId = fileDef.field;

                    return (
                        <div key={fileDef.field} style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{fileDef.label}</p>
                            
                            {/* แสดงชื่อไฟล์ปัจจุบันหรือไฟล์ใหม่ที่เลือก */}
                            {fileToDisplay ? (
                                <p style={{ color: isNewFileSelected ? 'green' : '#000' }}>
                                    ไฟล์ปัจจุบัน: 
                                    <a 
                                        href={isNewFileSelected ? URL.createObjectURL(fileToDisplay) : new URL(fileToDisplay.path, SERVER_BASE_URL).href} 
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ marginLeft: '5px', color: isNewFileSelected ? 'green' : '#007bff' }}
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} /> {fileToDisplay.name}
                                    </a>
                                </p>
                            ) : <p style={{ fontStyle: 'italic', color: '#666' }}>*ยังไม่มีไฟล์ (จำเป็นต้องแนบ)</p>}
                            
                            {/* Input สำหรับเลือกไฟล์ใหม่ */}
                            <label htmlFor={inputId} style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '10px' }}>
                                {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                            </label>
                            <input
                                id={inputId}
                                type="file"
                                name={fileDef.field} // ใช้ Field Name สั้นในการส่งไฟล์ใหม่
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, fileDef.field)}
                            />
                            {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles[fileDef.field].name}</p>}
                        </div>
                    );
                })}
            </div>

        </>
    );
}

export default Form6Edit;
