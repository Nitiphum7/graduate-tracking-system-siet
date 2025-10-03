import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

// Component สำหรับแก้ไข "ผลสอบวัดคุณสมบัติ" (Qualifying Exam)
const QualifyingExamEdit = ({ formData, initialData, handleChange, handleFileChange, newFiles }) => {
    const SERVER_BASE_URL = 'http://localhost:3000';

    const currentFile = initialData?.form_details?.files?.[0]; 
    const isNewFileSelected = newFiles['qualifying_exam_file'];
    const fileToDisplay = isNewFileSelected ? newFiles['qualifying_exam_file'] : currentFile;
    
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            return '';
        }
    };

    return (
        <fieldset style={{ marginBottom: '15px' }}>
            <legend>📝 แก้ไขข้อมูลผลการสอบวัดคุณสมบัติ</legend>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="exam_date">วันที่สอบ:</label>
                    <input
                        type="date"
                        name="exam_date"
                        id="exam_date"
                        value={formatDateForInput(formData.exam_date)}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                 <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="result">ผลการสอบ (Result):</label>
                    <select
                        name="result"
                        id="result"
                        value={formData.result || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    >
                        <option value="">-- กรุณาเลือกผลสอบ --</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                 <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>📎 ไฟล์แนบ (ใบรับรองผลสอบ)</label>
                 <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                    {fileToDisplay ? (
                        <p style={{ margin: '5px 0' }}>ไฟล์ปัจจุบัน:
                            <a 
                                href={isNewFileSelected ? URL.createObjectURL(fileToDisplay) : new URL(fileToDisplay.path, SERVER_BASE_URL).href} 
                                target="_blank" rel="noopener noreferrer" 
                                style={{ color: isNewFileSelected ? 'green' : '#007bff', marginLeft: '5px' }}>
                                <FontAwesomeIcon icon={faFilePdf} /> {fileToDisplay.name}
                            </a>
                        </p>
                    ) : <p style={{ fontStyle: 'italic', color: '#666', margin: '5px 0' }}>*ยังไม่มีไฟล์</p>}

                    <label htmlFor="qualifying-exam-file-input" style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                        {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                    </label>
                    <input
                        id="qualifying-exam-file-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'qualifying_exam_file')}
                    />
                    {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles['qualifying_exam_file'].name}</p>}
                </div>
            </div>
        </fieldset>
    );
};

export default QualifyingExamEdit;