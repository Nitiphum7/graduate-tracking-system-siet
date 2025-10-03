import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, updateDocument, getAllAdvisors } from '../../utils/api';
import DocumentForm from '../../components/DocumentForm'; // Import the reusable form component
import styles from './EditDocumentPage.module.css';

function EditDocumentPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  
  const [documentData, setDocumentData] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- A. Fetch Original Document Data ---
  useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (!docId) throw new Error("Missing Document ID.");
                
                // ⭐ 3. ดึงข้อมูล 2 ส่วนพร้อมกันด้วย Promise.all
                const [docResponse, advisorsResponse] = await Promise.all([
                    getDocumentById(docId),
                    getAllAdvisors()
                ]);
                
                setDocumentData(docResponse.data.data);
                setAdvisors(advisorsResponse.data);

            } catch (err) {
                const errorMessage = err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [docId]);

  // --- B. Handle Form Submission (Update) ---
  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      
      // Send FormData (including file) to the API for update (PUT/PATCH)
      await updateDocument(docId, formData); 
      
      alert('แก้ไขเอกสารสำเร็จ!');
      navigate('/student/status'); // Redirect back to status page
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกการแก้ไข');
      setIsLoading(false);
      console.error("Update error:", err);
    }
  };

  // --- Render Status ---
  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className={styles.error}>ข้อผิดพลาด: {error}</div>;
  }
  
  if (!documentData) {
      return <div className={styles.error}>ไม่พบเอกสารที่ต้องการแก้ไข</div>;
  }

  return (
    <div className={styles.container}>     
      {/* Use the reusable DocumentForm component */}
      <DocumentForm 
        initialData={documentData}
        advisors={advisors}     
        onSubmit={handleSubmit}        
        submitButtonText="บันทึกการแก้ไข"
      />
    </div>
  );
}

export default EditDocumentPage;
