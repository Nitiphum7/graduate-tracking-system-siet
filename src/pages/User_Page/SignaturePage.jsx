import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-pad-wrapper';
import styles from './SignaturePage.module.css';
import logo from '../../assets/images/logo.png';

function SignaturePage() {
  const [activeTab, setActiveTab] = useState('draw');
  const [uploadedImage, setUploadedImage] = useState(null);
  const sigPad = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // URL ของ Server API (ควรย้ายไปเก็บในไฟล์ .env ในโปรเจคจริง)
  const API_URL = 'http://localhost:3000';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearCanvas = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  // --- ส่วนที่แก้ไข: เปลี่ยนมาเรียก API ---
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
    } else if (isImageUploaded) {
      signatureData = uploadedImage;
    } else if (!isCanvasEmpty) {
      signatureData = sigPad.current.toDataURL('image/png');
    }

    if (!signatureData) {
      alert("เกิดข้อผิดพลาด: ไม่สามารถดึงข้อมูลลายเซ็นได้ กรุณาลองอีกครั้ง");
      return;
    }

    try {
        // 1. ดึงข้อมูล user และ token จาก Local Storage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!storedUser || !storedUser.id) {
            alert("⚠️ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
            navigate('/login');
            return;
        }

        // 2. ส่งข้อมูลลายเซ็นไปยัง Server
        const response = await fetch(`${API_URL}/api/users/${storedUser.id}/signature`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ส่ง Token เพื่อยืนยันตัวตน (ถ้ามี)
            },
            body: JSON.stringify({ signatureData: signatureData })
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึกลายเซ็น');
        }

        // 3. อัปเดตข้อมูล user ใน Local Storage ให้เป็นปัจจุบัน
        const updatedUser = { ...storedUser, ...result.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 4. แจ้งเตือนและนำทางไปยังหน้า Home
        alert("✅ บันทึกลายเซ็นของคุณเรียบร้อยแล้ว");
        navigate(`/${storedUser.role}/home`);

    } catch (error) {
        alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        console.error("Signature submission failed:", error);
    }
  };
  // --- จบส่วนที่แก้ไข ---

  return (
    // ... ส่วน JSX ไม่มีการเปลี่ยนแปลง ...
    <div className={styles.signaturePageContainer}>
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