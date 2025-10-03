import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

// =================================================================
// Component สำหรับแก้ไขข้อมูลผลสอบภาษาอังกฤษ (English Proficiency Exam)
// =================================================================
const EnglishExamEdit = ({ formData, initialData, handleChange, handleFileChange, newFiles }) => {
    const SERVER_BASE_URL = 'http://localhost:3000';

    // ดึงข้อมูลไฟล์จาก initialData.form_details
    const currentFile = initialData?.form_details?.files?.[0]; 
    const isNewFileSelected = newFiles['english_exam_file'];
    const fileToDisplay = isNewFileSelected ? newFiles['english_exam_file'] : currentFile;
    
    // --- Helper function สำหรับแปลงค่าวันที่ให้เป็น YYYY-MM-DD ---
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            // สร้าง Date object และดึงค่า ปี-เดือน-วัน
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Invalid date format:", dateString);
            return '';
        }
    };

    return (
        <fieldset style={{ marginBottom: '15px' }}>
            <legend>📝 แก้ไขข้อมูลผลการสอบภาษาอังกฤษ</legend>

            {/* ----- Row 1: ประเภทการสอบ และ วันที่สอบ ----- */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="exam_type">ประเภทการสอบ:</label>
                    <input
                        type="text"
                        name="exam_type"
                        id="exam_type"
                        value={formData.exam_type || ''}
                        onChange={handleChange}
                        placeholder="เช่น TOEFL, IELTS, CU-TEP"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="exam_date">วันที่สอบ:</label>
                    <input
                        type="date"
                        name="exam_date"
                        id="exam_date"
                        value={formatDateForInput(formData.exam_date)}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
            </div>

            {/* ----- Row 2: คะแนนส่วนต่างๆ ----- */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="reading_score">คะแนนการอ่าน (Reading):</label>
                    <input
                        type="number"
                        name="reading_score"
                        id="reading_score"
                        value={formData.reading_score || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="listening_score">คะแนนการฟัง (Listening):</label>
                    <input
                        type="number"
                        name="listening_score"
                        id="listening_score"
                        value={formData.listening_score || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                 <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="total_score">คะแนนรวม (Total/Overall):</label>
                    <input
                        type="number"
                        name="total_score"
                        id="total_score"
                        value={formData.total_score || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
            </div>

             {/* ----- Row 3: ผลการสอบ ----- */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="result">ผลการสอบ (Result):</label>
                <input
                    type="text"
                    name="result"
                    id="result"
                    value={formData.result || ''}
                    onChange={handleChange}
                    placeholder="เช่น ผ่าน, ไม่ผ่าน, หรือระบุผลตามเกณฑ์"
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>


            {/* ----- ส่วนจัดการไฟล์แนบ ----- */}
            <div className="form-group">
                 <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>📎 ไฟล์แนบ (ผลสอบ)</label>
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

                    <label htmlFor="english-exam-file-input" style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                        {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                    </label>
                    <input
                        id="english-exam-file-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'english_exam_file')} // ใช้ key 'english_exam_file' ในการส่ง
                    />
                    {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles['english_exam_file'].name}</p>}
                </div>
            </div>
        </fieldset>
    );
};

export default EnglishExamEdit;