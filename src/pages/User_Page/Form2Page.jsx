import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Form2Page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
// 💡 แก้ไข: Import API Call Functions แทน API_URL, getAuthHeaders
import { getForm2Data, submitForm2 } from '../../utils/api'; 

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function Form2Page() {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [studentInfo, setStudentInfo] = useState(null);
  const [advisorLists, setAdvisorLists] = useState({
    mainAdvisorName: '', coAdvisor1Name: '', potentialChairs: [],
    potentialCoAdvisors2: [], internalMembers: [], externalMembers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    thesisTitleTh: '', thesisTitleEn: '', committeeChair: '', coAdvisor2: '',
    committeeMember5: '', reserveExternal: '', reserveInternal: '',
    registrationSemester: '', registrationYear: '', comment: '',
    files: {
      proposalFile_th: null, proposalFile_en: null, coverPageFile_th: null,
      coverPageFile_en: null, registrationProofFile: null,
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
        navigate('/login');
        return;
    }

    const loadPageData = async () => {
      try {
        // 💡 แก้ไข: ใช้ getForm2Data จาก api.js (ซึ่งใช้ Axios)
        const response = await getForm2Data(currentUser.id);
        const data = response.data; // Axios จะส่งข้อมูลอยู่ใน field .data

        setStudentInfo(data.studentInfo);
        setAdvisorLists(data.advisorLists);

      } catch (err) {
        // Axios Error จะอยู่ที่ err.response.data.message
        const errorMessage = err.response?.data?.message || err.message || "ไม่สามารถดึงข้อมูลสำหรับฟอร์ม 2 ได้";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [currentUser, authLoading, navigate]);

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const key = name || id;
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file); // สร้าง URL ชั่วคราว

      // ก่อนที่จะตั้งค่าใหม่, ให้ลบ URL เก่า (ถ้ามี) เพื่อป้องกัน memory leak
      const oldFileData = formData.files[name];
      if (oldFileData && oldFileData.previewUrl) {
        URL.revokeObjectURL(oldFileData.previewUrl);
      }

      setFormData(prev => ({
        ...prev,
        files: { 
          ...prev.files, 
          [name]: { file: file, previewUrl: previewUrl } // 💡 เก็บเป็น Object
        }
      }));
    }
  };
  
  const handleRemoveFile = (fileName) => {
      // 💡 อ่านข้อมูลไฟล์ที่จะลบ
      const fileData = formData.files[fileName];

      // 💡 ถ้ามี URL อยู่, ให้ revoke มันทิ้ง
      if (fileData && fileData.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }

      setFormData(prev => ({
        ...prev,
        files: { ...prev.files, [fileName]: null } // ตั้งค่ากลับเป็น null
      }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (Object.values(formData.files).some(file => file === null)) {
        alert("กรุณาแนบไฟล์ประกอบให้ครบถ้วนทุกช่อง");
        return;
      }

      try {
        setLoading(true);
        // 1. แปลงไฟล์เป็น Data URL
        const filePromises = Object.values(formData.files).map(fileData => fileToDataUrl(fileData.file));
        const fileUrls = await Promise.all(filePromises);

        // 2. สร้างโครงสร้างข้อมูล submissionData (เหมือนเดิม)
        const submissionData = {
          student_user_id: currentUser.id,
          thesis_title_th: formData.thesisTitleTh,
          thesis_title_en: formData.thesisTitleEn,
          committee: {
            chair_id: formData.committeeChair,
            co_advisor2_id: formData.coAdvisor2,
            member5_id: formData.committeeMember5,
            reserve_external_id: formData.reserveExternal,
            reserve_internal_id: formData.reserveInternal,
          },
          // 💡 ตรวจสอบลำดับการ Map URL/File Name ให้ตรงกับ Promise.all
          files: [
            // 💡 แก้ไข: ต้องดึงชื่อจาก .file.name
            { type: 'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (ไทย)', name: formData.files.proposalFile_th.file.name, url: fileUrls[0] },
            { type: 'ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์ (อังกฤษ)', name: formData.files.proposalFile_en.file.name, url: fileUrls[1] },
            { type: 'ไฟล์หน้าปกของหัวข้อและเค้าโครง (ไทย)', name: formData.files.coverPageFile_th.file.name, url: fileUrls[2] },
            { type: 'ไฟล์หน้าปกของหัวข้อและเค้าโครง (อังกฤษ)', name: formData.files.coverPageFile_en.file.name, url: fileUrls[3] },
            { type: 'ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด', name: formData.files.registrationProofFile.file.name, url: fileUrls[4] }
          ],
          details: {
            registration_semester: formData.registrationSemester,
            registration_year: formData.registrationYear,
          },
          student_comment: formData.comment,
        };
        
        // 💡 แก้ไข: ใช้ submitForm2 จาก api.js
        await submitForm2(submissionData);
        
        alert("✅ ยืนยันและส่งแบบฟอร์มเสนอหัวข้อเรียบร้อยแล้ว!");
        navigate("/student/status");

      } catch (error) {
        console.error("Form 2 submission error:", error);
        // ดึง Error message จาก Axios response
        const errorMessage = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการส่งฟอร์ม";
        alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
  };

  if (loading || authLoading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error}</div>;

  const currentThaiYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentThaiYear - i);

  return (
    // ... (โค้ดส่วน UI ที่เหลือ)
    <div className={styles.formContainer}>
      <h2>📑 แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>📌 ข้อมูลนักศึกษา</legend>
          <div className={`${styles.infoGrid} ${styles.threeCols}`}>
            <div><label>ชื่อ-นามสกุล:</label><input type="text" value={studentInfo?.fullname || ''} disabled /></div>
            <div><label>รหัสนักศึกษา:</label><input type="text" value={studentInfo?.student_id || ''} disabled /></div>
            <div><label>ระดับปริญญา:</label><input type="text" value={studentInfo?.degree || ''} disabled /></div>
          </div>
          <div className={styles.infoGrid}>
            <div><label>หลักสูตรและสาขาวิชา:</label><input type="text" value={studentInfo?.program_name || ''} disabled /></div>
            <div><label>ภาควิชา:</label><input type="text" value={studentInfo?.department_name || ''} disabled /></div>
          </div>
        </fieldset>
        
        <fieldset>
          <legend>📖 หัวข้อวิทยานิพนธ์</legend>
          <div className={styles.formGroup}>
            <label htmlFor="thesisTitleTh">ชื่อเรื่อง (ภาษาไทย)*</label>
            <textarea id="thesisTitleTh" name="thesisTitleTh" value={formData.thesisTitleTh} onChange={handleChange} rows="3" placeholder="กรอกชื่อเรื่องวิทยานิพนธ์ภาษาไทย..." required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="thesisTitleEn">ชื่อเรื่อง (ภาษาอังกฤษ)*</label>
            <textarea id="thesisTitleEn" name="thesisTitleEn" value={formData.thesisTitleEn} onChange={handleChange} rows="3" placeholder="กรอกชื่อเรื่องวิทยานิพนธ์ภาษาอังกฤษ..." required />
          </div>
        </fieldset>

        <fieldset>
            <legend>👨‍🏫 อาจารย์ที่ปรึกษาและคณะกรรมการสอบ</legend>
            <div className={styles.subSection}>
              <label className={styles.subSectionLabel}>รายชื่ออาจารย์ที่ปรึกษา</label>
              <div className={`${styles.infoGrid}`}>
                <div><label>อาจารย์ที่ปรึกษาหลัก:</label><input type="text" value={advisorLists.mainAdvisorName} disabled /></div>
                <div><label>อาจารย์ที่ปรึกษาร่วม 1:</label><input type="text" value={advisorLists.coAdvisor1Name} disabled /></div>
              </div>
            </div>
            <div className={styles.subSection}>
                <label className={styles.subSectionLabel}>เสนอชื่อคณะกรรมการสอบ*</label>
                <div className={styles.formGroup}>
                    <label htmlFor="committeeChair">ประธานกรรมการสอบ*</label>
                    <select id="committeeChair" name="committeeChair" value={formData.committeeChair} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.potentialChairs.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="coAdvisor2">กรรมการสอบ (ท่านที่ 1)*</label>
                    <select id="coAdvisor2" name="coAdvisor2" value={formData.coAdvisor2} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.potentialCoAdvisors2.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="committeeMember5">กรรมการสอบ (ท่านที่ 2)*</label>
                    <select id="committeeMember5" name="committeeMember5" value={formData.committeeMember5} onChange={handleChange} required>
                        <option value="">-- เลือก --</option>
                        {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                    </select>
                </div>
            </div>
            <div className={styles.subSection}>
              <label className={styles.subSectionLabel}>เสนอชื่อกรรมการสำรอง*</label>
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="reserveExternal">กรรมการสำรอง (จากภายนอก)*</label>
                  <select id="reserveExternal" name="reserveExternal" value={formData.reserveExternal} onChange={handleChange} required>
                    <option value="">-- เลือก --</option>
                    {advisorLists.externalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="reserveInternal">กรรมการสำรอง (จากภายใน)*</label>
                  <select id="reserveInternal" name="reserveInternal" value={formData.reserveInternal} onChange={handleChange} required>
                    <option value="">-- เลือก --</option>
                    {advisorLists.internalMembers.map(adv => <option key={adv.advisor_id} value={adv.advisor_id}>{`${adv.prefix_th}${adv.first_name_th} ${adv.last_name_th}`.trim()}</option>)}
                  </select>
                </div>
              </div>
            </div>
        </fieldset>

        {/* ✅✅✅ SECTION แนบเอกสารประกอบ (โค้ดเดิม) ✅✅✅ */}
        <fieldset>
          <legend>📎 แนบเอกสารประกอบ</legend>

          <div className={`${styles.subSection} ${formData.files.proposalFile_th && formData.files.proposalFile_en ? styles.attached : ''}`}>
            <label>1. ไฟล์หัวข้อและเค้าโครงวิทยานิพนธ์* (.pdf, .docx)</label>
            <div className={styles.fileGroup}>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาไทย:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_PROPOSAL_TH_DD-MM-YYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
                        <label htmlFor="proposalFile_th" className={styles.fileInputLabel}>{formData.files.proposalFile_th ? 'เปลี่ยนไฟล์' : 'เเนบไฟล์'}</label>
                        <input type="file" id="proposalFile_th" name="proposalFile_th" onChange={handleFileChange} accept=".pdf,.doc,.docx"/>
                        {formData.files.proposalFile_th ? (
                            <div className={styles.fileInfo}>
                                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                
                                {/* ✅✅✅ โค้ดที่แก้ไข ✅✅✅ */}
                                <a 
                                    href={formData.files.proposalFile_th.previewUrl} // 💡 ใช้ previewUrl
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.fileNameDisplay} // 💡 เพิ่มคลาสใหม่
                                >
                                  {formData.files.proposalFile_th.file.name} {/* 💡 ใช้ .file.name */}
                                </a>
                                {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}

                                <button type="button" onClick={() => handleRemoveFile('proposalFile_th')} className={styles.removeFileBtn}><FontAwesomeIcon icon={faTimes} /></button>
                            </div>
                        ) : (<span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>)}
                    </div>
                </div>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาอังกฤษ:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_PROPOSAL_EN_DD-MM-YYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
                    <label htmlFor="proposalFile_en" className={styles.fileInputLabel}>{formData.files.proposalFile_en ? 'เปลี่ยนไฟล์' : 'เเนบไฟล์'}</label>
                    <input type="file" id="proposalFile_en" name="proposalFile_en" onChange={handleFileChange} accept=".pdf,.doc,.docx"/>
                    
                    {/* ✅✅✅ แก้ไขส่วนนี้ให้เหมือนกับช่องภาษาไทย ✅✅✅ */}
                    {formData.files.proposalFile_en ? (
                        <div className={styles.fileInfo}>
                            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                            
                            <a 
                                href={formData.files.proposalFile_en.previewUrl} /* 💡 ใช้ .previewUrl */
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.fileNameDisplay} 
                            >
                                {formData.files.proposalFile_en.file.name} {/* 💡 ใช้ .file.name */}
                            </a>
                            
                            <button type="button" onClick={() => handleRemoveFile('proposalFile_en')} className={styles.removeFileBtn}><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                    ) : (<span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>)}
                    {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
                </div>
                </div>
            </div>
          </div>

          <div className={`${styles.subSection} ${formData.files.coverPageFile_th && formData.files.coverPageFile_en ? styles.attached : ''}`}>
            <label>2. ไฟล์หน้าปกของหัวข้อและเค้าโครง* (.pdf, .docx)</label>
            <div className={styles.fileGroup}>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาไทย:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_COVER_TH_DDMMYYYY.pdf</small>
                  <div className={styles.fileInputWrapper}>
    <label htmlFor="coverPageFile_th" className={styles.fileInputLabel}>{formData.files.coverPageFile_th ? 'เปลี่ยนไฟล์' : 'เเนบไฟล์'}</label>
    <input type="file" id="coverPageFile_th" name="coverPageFile_th" onChange={handleFileChange} accept=".pdf,.doc,.docx"/>
    
    {/* ✅✅✅ โค้ดที่แก้ไข ✅✅✅ */}
    {formData.files.coverPageFile_th ? (
        <div className={styles.fileInfo}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
            <a 
                href={formData.files.coverPageFile_th.previewUrl} /* 💡 ใช้ .previewUrl */
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fileNameDisplay} 
            >
                {formData.files.coverPageFile_th.file.name} {/* 💡 ใช้ .file.name */}
            </a>
            <button type="button" onClick={() => handleRemoveFile('coverPageFile_th')} className={styles.removeFileBtn}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
    ) : (<span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>)}
    {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
</div>
                </div>
                <div className={styles.fileInputSubgroup}>
                    <label className={styles.subLabel}>ไฟล์ภาษาอังกฤษ:</label>
                    <small className={styles.fileNamingInstruction}>*ตั้งชื่อ: รหัสนักศึกษา_F2_COVER_EN_DDMMYYYY.pdf</small>
                    <div className={styles.fileInputWrapper}>
    <label htmlFor="coverPageFile_en" className={styles.fileInputLabel}>{formData.files.coverPageFile_en ? 'เปลี่ยนไฟล์' : 'เเนบไฟล์'}</label>
    <input type="file" id="coverPageFile_en" name="coverPageFile_en" onChange={handleFileChange} accept=".pdf,.doc,.docx"/>
    
    {/* ✅✅✅ โค้ดที่แก้ไข ✅✅✅ */}
    {formData.files.coverPageFile_en ? (
        <div className={styles.fileInfo}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
            <a 
                href={formData.files.coverPageFile_en.previewUrl} /* 💡 ใช้ .previewUrl */
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fileNameDisplay} 
            >
                {formData.files.coverPageFile_en.file.name} {/* 💡 ใช้ .file.name */}
            </a>
            <button type="button" onClick={() => handleRemoveFile('coverPageFile_en')} className={styles.removeFileBtn}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
    ) : (<span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>)}
    {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
</div>
                </div>
            </div>
          </div>
          
          <div className={`${styles.subSection} ${formData.files.registrationProofFile ? styles.attached : ''}`}>
            <label>3. ไฟล์สำเนาการลงทะเบียนภาคการศึกษาล่าสุด* (.pdf, .jpg)</label>
            <small className={styles.fileNamingInstruction}>*กรุณาตั้งชื่อไฟล์เป็น: รหัสนักศึกษา_F2_REGIS_DDMMYYYY.jpg</small>
            <div className={styles.inlineSelectGroup}>
              <label htmlFor="registrationSemester">ภาคการศึกษาที่:</label>
              <select id="registrationSemester" name="registrationSemester" value={formData.registrationSemester} onChange={handleChange} className={styles.inlineSelect} required>
                <option value="">เลือก</option><option value="1">1</option><option value="2">2</option><option value="ภาคพิเศษ">ภาคพิเศษ</option>
              </select>
              <label htmlFor="registrationYear">ปีการศึกษา:</label>
              <select id="registrationYear" name="registrationYear" value={formData.registrationYear} onChange={handleChange} className={styles.inlineSelect} required>
                <option value="">เลือกปี</option>
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div className={styles.fileInputWrapper}>
    <label htmlFor="registrationProofFile" className={styles.fileInputLabel}>{formData.files.registrationProofFile ? 'เปลี่ยนไฟล์' : 'เเนบไฟล์'}</label>
    <input type="file" id="registrationProofFile" name="registrationProofFile" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg"/>
    
    {/* ✅✅✅ โค้ดที่แก้ไข ✅✅✅ */}
    {formData.files.registrationProofFile ? (
        <div className={styles.fileInfo}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
            <a 
                href={formData.files.registrationProofFile.previewUrl} /* 💡 ใช้ .previewUrl */
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fileNameDisplay} 
            >
                {formData.files.registrationProofFile.file.name} {/* 💡 ใช้ .file.name */}
            </a>
            <button type="button" onClick={() => handleRemoveFile('registrationProofFile')} className={styles.removeFileBtn}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
    ) : (<span className={styles.fileNameDisplay}>ยังไม่ได้เลือกไฟล์</span>)}
    {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
</div>
          </div>
        </fieldset>
        
        <button type="submit">📤 ยืนยันและส่งแบบฟอร์ม</button>
      </form>
    </div>
  );
}

export default Form2Page;