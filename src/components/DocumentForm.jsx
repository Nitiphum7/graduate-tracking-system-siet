import React, { useState, useEffect } from 'react';
import styles from './DocumentForm.module.css';
// ตรวจสอบ Path นี้ให้ตรงกับตำแหน่งจริงของไฟล์
import Form4Edit from "./document-forms/Form4Edit";
import Form6Edit from "./document-forms/Form6Edit";
import EnglishExamEdit from "./document-forms/EnglishExamEdit";
import QualifyingExamEdit from "./document-forms/QualifyingExamEdit";

// =================================================================
// 0. Component ย่อยสำหรับ Form 2 File Attachment (รวม Logic การแสดงผลหลายไฟล์)
//    (ปกติจะอยู่ในไฟล์แยก แต่รวมไว้ที่นี่เพื่อให้โค้ดสมบูรณ์ใน Canvas)
// =================================================================
const Form2FileAttachment = ({ initialData, handleFileChange, newFiles }) => {
    const SERVER_BASE_URL = 'http://localhost:3000';

    // รายการไฟล์ที่ต้องมีสำหรับ Form 2 (ใช้ชื่อเต็มในการค้นหา)
    const requiredFileTypesForForm2 = [
        'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (ไทย)', 'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (อังกฤษ)',
        'ไฟล์หน้าปกของหัวข้อและเค้าโครง (ไทย)', 'ไฟล์หน้าปกของหัวข้อและเค้าโครง (อังกฤษ)',
        'ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด'
    ];

    const filesArray = Array.isArray(initialData.files) ? initialData.files : [];

    return (
        <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>📎 ไฟล์แนบ (เค้าโครงวิทยานิพนธ์)</label>

            {requiredFileTypesForForm2.map((fileType, index) => {
                const currentFile = filesArray.find(f => f.type === fileType);
                const isNewFileSelected = newFiles[fileType];
                const fileToDisplay = isNewFileSelected ? newFiles[fileType] : currentFile;

                const inputId = `form2-file-input-${index}`;
                return (
                    <div key={fileType} className="file-upload-item" style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>{fileType}</p>
                        
                        {/* แสดงชื่อไฟล์ปัจจุบันหรือไฟล์ใหม่ที่เลือกแบบมีไอคอน */}
                        {fileToDisplay ? (
                            <p style={{ margin: '5px 0' }}>ไฟล์ปัจจุบัน:
                                <a 
                                    href={isNewFileSelected ? URL.createObjectURL(fileToDisplay) : new URL(fileToDisplay.path, SERVER_BASE_URL).href} 
                                    target="_blank" rel="noopener noreferrer" 
                                    style={{ color: isNewFileSelected ? 'green' : '#007bff', marginLeft: '5px' }}>
                                    📄 {fileToDisplay.name}
                                </a>
                            </p>
                        ) : <p style={{ fontStyle: 'italic', color: '#666', margin: '5px 0' }}>*ยังไม่มีไฟล์</p>}

                        <label htmlFor={inputId} style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                            {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                        </label>
                        <input
                            id={inputId}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, fileType)}
                        />
                        {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles[fileType].name}</p>}
                    </div>
                );
            })}
        </div>
    );
};


// --------------------------------------------------------------------------
// 1. Component ย่อยสำหรับ Form 1 (เลือกอาจารย์ที่ปรึกษา)
// --------------------------------------------------------------------------
const Form1Edit = ({ formData, handleChange, advisors, initialData }) => {
    const coAdvisorOptions = advisors.filter(adv => adv.advisor_id && adv.advisor_id !== formData.main_advisor_id);

    return (
        <fieldset style={{ marginBottom: '15px' }}>
            <legend>👨‍🏫 เลือกอาจารย์ที่ปรึกษา</legend>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="main_advisor_id">อาจารย์ที่ปรึกษาหลัก*:</label>
                <select name="main_advisor_id" required value={formData.main_advisor_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`main-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="co_advisor_id">อาจารย์ที่ปรึกษาร่วม (ถ้ามี):</label>
                <select name="co_advisor_id" value={formData.co_advisor_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- ไม่เลือก --</option>
                    {coAdvisorOptions.map(adv => <option key={`co-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
        </fieldset>
    );
};

// --------------------------------------------------------------------------
// 2. Component ย่อยสำหรับ Form 2 (หัวข้อและกรรมการสอบ)
// --------------------------------------------------------------------------
const Form2Edit = ({ formData, handleChange, advisors }) => {
    return (
        <fieldset style={{ marginBottom: '15px' }}>
            <legend>📖 ข้อมูลหัวข้อและกรรมการสอบ</legend>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="thesis_title_th">หัวข้อวิทยานิพนธ์ (ภาษาไทย):</label>
                <textarea name="thesis_title_th" value={formData.thesis_title_th || ''} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="thesis_title_en">หัวข้อวิทยานิพนธ์ (ภาษาอังกฤษ):</label>
                <textarea name="thesis_title_en" value={formData.thesis_title_en || ''} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="chair_id">ประธานกรรมการสอบ:</label>
                <select name="chair_id" value={formData.chair_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`chair-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
            {/* ... โค้ดสำหรับกรรมการสอบอื่น ๆ ที่เหลือของ Form 2 ... */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="co_advisor2_id">กรรมการสอบ (คนที่ 5):</label>
                <select name="co_advisor2_id" value={formData.co_advisor2_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`co2-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="member5_id">กรรมการสอบ:</label>
                <select name="member5_id" value={formData.member5_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`member5-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="reserve_internal_id">อาจารย์สำรองภายใน:</label>
                <select name="reserve_internal_id" value={formData.reserve_internal_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`res-int-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="reserve_external_id">อาจารย์สำรองภายนอก:</label>
                <select name="reserve_external_id" value={formData.reserve_external_id || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="">-- กรุณาเลือก --</option>
                    {advisors.map(adv => <option key={`res-ext-${adv.advisor_id}`} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`}</option>)}
                </select>
            </div>
        </fieldset>
    );
};


// --------------------------------------------------------------------------
// 3. Component สำหรับจัดการไฟล์แนบ (สำหรับ Form ที่มีไฟล์เดียว: Form 3, 5, 7, ...)
// --------------------------------------------------------------------------
const FileAttachmentSection = ({ initialData, handleFileChange, newFiles }) => {
    const SERVER_BASE_URL = 'http://localhost:3000';
    const documentTypeId = initialData?.document_type_id;

    // Form ID ที่ไม่มีส่วนแนบไฟล์เลย
    const FORMS_WITHOUT_FILES = [1];
    
    // ไม่แสดงส่วนนี้ถ้าเป็น Form ที่ไม่มีไฟล์ [1] หรือ Form ที่มี Component จัดการไฟล์ของตัวเอง [2, 4, 6]
    if (FORMS_WITHOUT_FILES.includes(documentTypeId) || documentTypeId === 2 || documentTypeId === 4 || documentTypeId === 6) {
        return null;
    }

    // Logic สำหรับฟอร์มที่มีไฟล์เดียว (เช่น Form 3, 5, 7)
    const currentFile = initialData.files?.[0];
    const isNewFileSelected = newFiles['document_file'];
    const fileToDisplay = isNewFileSelected ? newFiles['document_file'] : currentFile;

    return (
        <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>ไฟล์แนบ</label>

            <div style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>ไฟล์เอกสารหลัก</p>
                
                {fileToDisplay ? (
                    // ⭐ แสดงผลไฟล์เดียวแบบมีไอคอนและลิงก์ชัดเจน ⭐
                    <p style={{ margin: '5px 0' }}>ไฟล์ปัจจุบัน:
                        <a 
                            href={isNewFileSelected ? URL.createObjectURL(fileToDisplay) : new URL(fileToDisplay.path, SERVER_BASE_URL).href} 
                            target="_blank" rel="noopener noreferrer" 
                            style={{ color: isNewFileSelected ? 'green' : '#007bff', marginLeft: '5px' }}>
                            📄 {fileToDisplay.name} 
                        </a>
                    </p>
                ) : <p style={{ fontStyle: 'italic', color: '#666', margin: '5px 0' }}>*ยังไม่มีไฟล์</p>}

                <label htmlFor="single-file-input" style={{ cursor: 'pointer', backgroundColor: '#e9e9e9', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block', marginTop: '5px'}}>
                    {fileToDisplay ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์ใหม่'}
                </label>
                <input
                    id="single-file-input"
                    type="file"
                    name="document_file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'document_file')}
                />
                {isNewFileSelected && <p style={{ color: 'green', margin: '5px 0 0' }}>ไฟล์ที่เลือก: {newFiles['document_file'].name}</p>}
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------
// 4. Component หลัก: DocumentForm
// --------------------------------------------------------------------------
function DocumentForm({ initialData, onSubmit, advisors = [], submitButtonText = "บันทึก" }) {

    const [formData, setFormData] = useState({});
    const [newFiles, setNewFiles] = useState({});

    // --- useEffect: โหลดข้อมูลเริ่มต้น ---
    useEffect(() => {
        if (initialData) {
            const committee = initialData.committee || {};
            const formDetails = initialData.form_details || {};

            setFormData({
                type_name: initialData.type_name || '',
                student_comment: initialData.student_comment || '',
                main_advisor_id: initialData.main_advisor_id || '',
                co_advisor_id: initialData.co_advisor_id || '',
                thesis_title_th: initialData.thesis_title_th || '',
                thesis_title_en: initialData.thesis_title_en || '',
                // Field คณะกรรมการ Form 2 เดิม
                co_advisor2_id: committee.co_advisor2_id || '',
                chair_id: committee.chair_id || '',
                member5_id: committee.member5_id || '',
                reserve_internal_id: committee.reserve_internal_id || '',
                reserve_external_id: committee.reserve_external_id || '',

                // ⭐ Field คณะกรรมการ Form 6 (ใช้ชื่อ field จาก Form 6 เดิม) ⭐
                committeeChair: formDetails.committee?.chair_id || committee.chair_id || '',
                coAdvisor2: formDetails.committee?.co_advisor2_id || committee.co_advisor2_id || '',
                committeeMember5: formDetails.committee?.member5_id || committee.member5_id || '',
                reserveExternal: formDetails.committee?.reserve_external_id || committee.reserve_external_id || '',
                reserveInternal: formDetails.committee?.reserve_internal_id || committee.reserve_internal_id || '',

                // ⭐ Field Form 4 (Evaluators Array) ⭐
                evaluators: formDetails.evaluators || [],
                document_types: formDetails.document_types || {},

                //EngExam
                exam_type: formDetails.exam_type || '',
                exam_date: formDetails.exam_date || '',
                reading_score: formDetails.reading_score || '',
                listening_score: formDetails.listening_score || '',
                total_score: formDetails.total_score || '',
                result: formDetails.result || '',
            });
            setNewFiles({});
        }
    }, [initialData]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            setNewFiles(prev => ({ ...prev, [fileType]: file }));
        }
    };

    // Logic จัดการ Evaluators (สำหรับ Form 4)
    const handleEvaluatorChange = (index, field, value) => {
        const newEvaluators = [...formData.evaluators];
        if (newEvaluators[index]) {
            newEvaluators[index] = { ...newEvaluators[index], [field]: value };
            setFormData(prev => ({ ...prev, evaluators: newEvaluators }));
        }
    };

    const addEvaluator = () => {
        setFormData(prev => ({
            ...prev,
            evaluators: [...prev.evaluators, { prefix: '', firstName: '', lastName: '', affiliation: '', phone: '', email: '' }]
        }));
    };

    const removeEvaluator = (index) => {
        const newEvaluators = formData.evaluators.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, evaluators: newEvaluators }));
    };

    // --- Logic การส่ง Form ---
    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = new FormData();

        // 1. ส่ง Field ระดับบนทั้งหมด (ยกเว้น Array/Object ที่ซับซ้อน)
        Object.keys(formData).forEach(key => {
            if (key !== 'evaluators' && key !== 'document_types' && formData[key] !== undefined && formData[key] !== null) {
                dataToSubmit.append(key, formData[key]);
            }
        });

        // 2. Logic สำหรับ Form 4 (แปลง Array/Object เป็น JSON String)
        if (initialData?.document_type_id === 4) {
            const evaluatorsJson = JSON.stringify(formData.evaluators || initialData.form_details?.evaluators || []);
            const docTypesJson = JSON.stringify(formData.document_types || initialData.form_details?.document_types || {});

            dataToSubmit.append('evaluators', evaluatorsJson);
            dataToSubmit.append('document_types', docTypesJson);
        }

        // 3. ส่งไฟล์ใหม่
        Object.keys(newFiles).forEach(fileType => {
            dataToSubmit.append(fileType, newFiles[fileType]);
        });
        onSubmit(dataToSubmit);
    };

    const documentTypeId = initialData?.document_type_id;

    // --- Render ---
    return (
        <form onSubmit={handleSubmit} className="document-form" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>กำลังแก้ไข: {initialData?.type_name || 'เอกสาร'}</h3>
            <p style={{ color: 'red', fontWeight: 'bold' }}>เหตุผลการตีกลับ: {initialData?.admin_comment || 'ไม่มีข้อมูล'}</p>

            <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อเอกสาร</label>
                <input type="text" name="type_name" value={formData.type_name || ''} disabled style={{ width: '100%', padding: '8px' }} />
            </div>

            {/* ------------------- ส่วนแสดง Form ย่อยตาม Type ------------------- */}
            {documentTypeId === 1 && (
                <Form1Edit
                    formData={formData}
                    handleChange={handleChange}
                    advisors={advisors}
                    initialData={initialData}
                />
            )}

            {documentTypeId === 2 && (
                <>
                    <Form2Edit
                        formData={formData}
                        handleChange={handleChange}
                        advisors={advisors}
                    />
                    {/* Component จัดการไฟล์ Form 2 */}
                    <Form2FileAttachment 
                        initialData={initialData}
                        handleFileChange={handleFileChange}
                        newFiles={newFiles}
                    />
                </>
            )}

            {documentTypeId === 4 && (
                <Form4Edit
                    formData={formData}
                    initialData={initialData}
                    handleChange={handleChange}
                    newFiles={newFiles}
                    advisors={advisors}
                    onEvaluatorChange={handleEvaluatorChange}
                    onAddEvaluator={addEvaluator}
                    onRemoveEvaluator={removeEvaluator}
                />
            )}

            {documentTypeId === 6 && (
                <Form6Edit
                    formData={formData}
                    initialData={initialData}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    newFiles={newFiles}
                    advisors={advisors}
                />
            )}

            {documentTypeId === 5 && ( // <--- สมมติว่า ID คือ 5
            <EnglishExamEdit
                formData={formData}
                initialData={initialData}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                newFiles={newFiles}
            />
)}

            {(documentTypeId === 7 || documentTypeId === 8) && (
        <EnglishExamEdit
            formData={formData}
            initialData={initialData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            newFiles={newFiles}
        />
    )}
    
    {documentTypeId === 9 && (
        <QualifyingExamEdit
            formData={formData}
            initialData={initialData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            newFiles={newFiles}
        />
    )}


            {/* ------------------- ช่องความคิดเห็นเพิ่มเติม ------------------- */}
            {/* แสดงถ้าไม่เป็น Form 4 (เพราะ Form 4 อาจมีช่อง Comment อยู่ใน Component ย่อย) */}
            {documentTypeId !== 4 && (
                <div className="form-group" style={{ marginBottom: '20px', marginTop: '10px' }}>
                    <label htmlFor="student_comment" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        💬 ความคิดเห็นเพิ่มเติม (ถึงผู้ตรวจสอบ/แอดมิน)
                    </label>
                    <textarea
                        id="student_comment"
                        name="student_comment"
                        value={formData.student_comment || ''}
                        onChange={handleChange}
                        rows="4"
                        placeholder="ระบุเหตุผลในการแก้ไข หรือข้อความอื่น ๆ ที่ต้องการสื่อสารกับผู้ตรวจสอบ..."
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '10px 15px', cursor: 'pointer' }}>{submitButtonText}</button>
        </form>
    );
}

export default DocumentForm;
