import React from 'react';

// Base URL ของ Backend ที่เสิร์ฟไฟล์
const SERVER_BASE_URL = 'http://localhost:3000'; 

// รายการไฟล์ที่ต้องการใน Form 2
const requiredFileTypesForForm2 = [
    'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (ไทย)', 
    'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (อังกฤษ)',
    'ไฟล์หน้าปกของหัวข้อและเค้าโครง (ไทย)', 
    'ไฟล์หน้าปกของหัวข้อและเค้าโครง (อังกฤษ)',
    'ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด'
];

function Form2FileAttachment({ initialData, handleFileChange, newFiles }) {
    
    // สร้าง Array ของไฟล์เพื่อให้ find() ใช้งานได้เสมอ
    const filesArray = Array.isArray(initialData.files) ? initialData.files : []; 

    return (
        <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>📎 ไฟล์แนบ (อัปโหลดใหม่เพื่อแทนที่)</label>
            
            {requiredFileTypesForForm2.map((fileType, index) => {
                // ค้นหาไฟล์เก่าโดยใช้ค่า fileType (ชื่อไทยเต็ม)
                const currentFile = filesArray.find(f => f.type === fileType);
                
                // ใช้ fileType เป็น key สำหรับ newFiles และ input name
                const isNewFileSelected = newFiles[fileType]; 
                const fileToDisplay = isNewFileSelected ? newFiles[fileType] : currentFile;
                
                const inputId = `form2-file-input-${index}`;

                return (
                    <div key={fileType} style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>{fileType}</p>
                        
                        {/* ⭐ แสดงผลเหมือน Form 6 (มีไอคอน) ⭐ */}
                        {fileToDisplay ? (
                            <p style={{ color: isNewFileSelected ? 'green' : '#000', margin: '5px 0' }}>
                                ไฟล์ปัจจุบัน: 
                                <a 
                                    href={isNewFileSelected ? URL.createObjectURL(fileToDisplay) : new URL(fileToDisplay.path, SERVER_BASE_URL).href} 
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ marginLeft: '5px', color: isNewFileSelected ? 'green' : '#007bff', fontWeight: 'normal' }}
                                >
                                    📄 {fileToDisplay.name}
                                </a>
                            </p>
                        ) : <p style={{ fontStyle: 'italic', color: '#666', margin: '5px 0' }}>*ยังไม่มีไฟล์</p>}

                        {/* Input สำหรับเลือกไฟล์ใหม่ */}
                        <label htmlFor={inputId} style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                            {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์ใหม่'}
                        </label>
                        <input
                            id={inputId}
                            type="file"
                            name={fileType} // ใช้ชื่อ Type ภาษาไทยเต็มในการส่งไฟล์ใหม่ (เพื่อให้ Backend Form 2 รับได้)
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, fileType)} // ใช้ fileType ในการอัปเดต newFiles
                        />
                        {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles[fileType].name}</p>}
                    </div>
                );
            })}
        </div>
    );
}

export default Form2FileAttachment;
