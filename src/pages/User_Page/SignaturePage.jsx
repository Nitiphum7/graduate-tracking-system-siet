// src/pages/User_Page/SignaturePage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // ✅ 1. Import useAuth
import SignaturePad from 'react-signature-pad-wrapper';
import styles from './SignaturePage.module.css';
import logo from '../../assets/images/logo.png';
import { updateUserSignature } from '../../utils/api';

function SignaturePage() {
    const { user, updateUserState } = useAuth();  // ✅ 2. ดึง user, token, และ "ฟังก์ชัน login" มาจาก Context
    const navigate = useNavigate();
    
    // State ของ UI ไม่มีการเปลี่ยนแปลง
    const [activeTab, setActiveTab] = useState('draw');
    const [uploadedImage, setUploadedImage] = useState(null);
    const sigPad = useRef(null);
    const fileInputRef = useRef(null);
    const API_URL = 'http://localhost:3000';

    // ... ฟังก์ชัน handleFileSelect, handleRemoveImage, clearCanvas ไม่มีการเปลี่ยนแปลง ...
    const handleFileSelect = (event) => { /* ... */ };
    const handleRemoveImage = () => { /* ... */ };
    const clearCanvas = () => { /* ... */ };


    const submitSignature = async () => {
        const isImageUploaded = !!uploadedImage;
        const isCanvasEmpty = sigPad.current ? sigPad.current.isEmpty() : true;

        if (isCanvasEmpty && !isImageUploaded) {
            alert("✍️ กรุณาวาดลายเซ็น หรือ อัปโหลดรูปภาพก่อนบันทึก");
            return;
        }

        let signatureData = null;
        if (activeTab === 'upload' && isImageUploaded) {
            signatureData = uploadedImage;
        } else if (activeTab === 'draw' && !isCanvasEmpty) {
            signatureData = sigPad.current.toDataURL('image/png');
        }

        if (!signatureData) {
            alert("เกิดข้อผิดพลาด: ไม่สามารถดึงข้อมูลลายเซ็นได้");
            return;
        }

        try {
            // ⭐ เรียกใช้ API ผ่านฟังก์ชันใหม่จาก api.js ทำให้โค้ดสะอาดและปลอดภัย
            const response = await updateUserSignature(user.id, signatureData);
            const result = response.data;

            // ⭐ อัปเดตข้อมูล user ส่วนกลางผ่านฟังก์ชันใหม่ `updateUserState`
            updateUserState(result.data);

            alert("✅ บันทึกลายเซ็นของคุณเรียบร้อยแล้ว");
            navigate(`/${user.role_name}/home`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            alert(`❌ เกิดข้อผิดพลาด: ${errorMessage}`);
        }
    };

    return (
        <div className={styles.signaturePageContainer}>
            {/* ... JSX ทั้งหมดเหมือนเดิม ไม่ต้องแก้ไข ... */}
            <div className={styles.signatureCard}>
        <img src={logo} alt="โลโก้สถาบันฯ" className={styles.cardLogo} />
        <h2>✍️ ตั้งค่าลายเซ็นออนไลน์</h2>
        <p>กรุณาตั้งค่าลายเซ็นเพื่อใช้ในการยื่นเอกสารต่างๆ ในระบบ</p>
        <div className={styles.tabsContainer}>
          <button onClick={() => setActiveTab('draw')} className={`${styles.tabBtn} ${activeTab === 'draw' ? styles.active : ''}`}>✍️ วาดลายเซ็น</button>
          <button onClick={() => setActiveTab('upload')} className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.active : ''}`}>🖼️ อัปโหลดรูปภาพ</button>
        </div>
        {activeTab === 'draw' && (
          <div className={styles.tabContent}>
            <p className={styles.tabDescription}>ใช้นิ้วหรือเมาส์วาดลายเซ็นในกรอบด้านล่าง</p>
            <div className={styles.canvasContainer}>
              <SignaturePad ref={sigPad} options={{ penColor: 'black' }} canvasProps={{ className: styles.signatureCanvas }}/>
            </div>
            <button onClick={clearCanvas} type="button" className={styles.clearBtn}>ล้าง</button>
          </div>
        )}
        {activeTab === 'upload' && (
          <div className={styles.tabContent}>
            <p className={styles.tabDescription}>อัปโหลดไฟล์รูปภาพลายเซ็นของคุณ (.png, .jpg)</p>
            <div className={styles.imagePreviewContainer}>
              {uploadedImage ? (<img src={uploadedImage} alt="ตัวอย่างลายเซ็น" className={styles.signaturePreview} />) : (<span>ยังไม่มีรูปภาพ</span>)}
            </div>
            <div className={styles.uploadActions}>
              <label htmlFor="signature-file-input" className={styles.uploadBtnWrapper}>เลือกรูปภาพ</label>
              {uploadedImage && (<button onClick={handleRemoveImage} className={styles.removeBtn}>ลบรูปภาพ</button>)}
            </div>
            <input type="file" id="signature-file-input" ref={fileInputRef} accept="image/png, image/jpeg" onChange={handleFileSelect} style={{ display: 'none' }}/>
          </div>
        )}
        <div className={styles.actions}>
          <button onClick={submitSignature} type="button">✅ บันทึกและดำเนินการต่อ</button>
        </div>
      </div>
        </div>
    );
}

export default SignaturePage;