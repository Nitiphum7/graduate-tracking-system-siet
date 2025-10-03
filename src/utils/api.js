import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// สร้าง Axios instance กลาง
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    // ดึง token จาก localStorage
    const token = localStorage.getItem('token');
    
    // ถ้ามี token ให้เพิ่ม Authorization header เข้าไป
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getDocumentById = (docId) => {
  return api.get(`/documents/${docId}`);
};

export const updateDocument = (docId, formData) => {
  return api.put(`/documents/${docId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getForm1Data = (userId) => {
  return api.get(`/form1/data/${userId}`);
};

export const submitForm1 = (submissionData) => {
  return api.post('/submissions/form1', submissionData);
};

export const getForm2Data = (userId) => {
  // ตรงกับ GET /api/forms/form2-data/:userId
  return api.get(`/forms/form2-data/${userId}`);
};

export const submitForm2 = (submissionData) => {
  // ตรงกับ POST /api/submissions/form2
  return api.post('/submissions/form2', submissionData);
};

export const getForm3Data = (userId) => {
  // ตรงกับ GET /api/forms/form3-data/:userId
  return api.get(`/forms/form3-data/${userId}`);
};

export const submitForm3 = (submissionData) => {
  // ตรงกับ POST /api/submissions/form3
  return api.post('/submissions/form3', submissionData);
};

export const getForm4Data = (userId) => {
  // ตรงกับ GET /api/forms/form4-data/:userId
  return api.get(`/forms/form4-data/${userId}`);
};

export const submitForm4 = (submissionData) => {
  // ตรงกับ POST /api/submissions/form4
  return api.post('/submissions/form4', submissionData);
};

export const getForm5Data = (userId) => {
  // ตรงกับ GET /api/forms/form5-data/:userId
  return api.get(`/forms/form5-data/${userId}`);
};

export const submitForm5 = (submissionData) => {
  // ตรงกับ POST /api/submissions/form5
  return api.post('/submissions/form5', submissionData);
};

export const getForm6Data = (userId) => {
  // ตรงกับ GET /api/forms/form6-data/:userId
  return api.get(`/forms/form6-data/${userId}`);
};

export const submitForm6 = (submissionData) => {
  // ตรงกับ POST /api/submissions/form6
  return api.post('/submissions/form6', submissionData);
};

export const submitExamResult = (submissionData) => {
  // ตรงกับ POST /api/submissions/exam-result
  return api.post('/submissions/exam-result', submissionData);
};

export const submitQEResult = (submissionData) => {
  // ตรงกับ POST /api/submissions/qe-result
  return api.post('/submissions/qe-result', submissionData);
};

export const getStudentDashboard = (userId) => {
  return api.get(`/dashboard/student/${userId}`);
};

export const updateUserSignature = (userId, signatureData) => {
  return api.put(`/users/${userId}/signature`, { signatureData });
};

export const getAllAdvisors = () => {
  return api.get('/advisors'); 
};

export const getSubmissionDetail = (submissionId) => {
  return api.get(`/submissions/${submissionId}`);
};

// ⭐ [เพิ่มใหม่] ฟังก์ชันสำหรับอาจารย์ในการอนุมัติ/ตีกลับเอกสาร ⭐
export const processApproval = (taskId, status, comment) => {
  return api.put(`/approvals/${taskId}`, { newStatus: status, comment: comment });
};

export default api;