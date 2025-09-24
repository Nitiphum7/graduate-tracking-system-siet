import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 

// --- Layouts ---
import UserLayout from './layouts/UserLayout'; 
import AdminLayout from './layouts/AdminLayout';

// --- Public Pages ---
import LoginPage from './pages/Auth_Page/Login';
import SignaturePage from './pages/User_Page/SignaturePage'; //ย้ายมาอยู่ตรงนี้จะเหมาะสมกว่า

// --- Student & User Pages ---
import HomePage from './pages/User_Page/HomePage'; 
import StatusPage from './pages/User_Page/StatusPage';
import DocumentDetailPage from './pages/User_Page/DocumentDetailPage';
import Form1Page from './pages/User_Page/Form1Page';
import Form2Page from './pages/User_Page/Form2Page';
import Form3Page from './pages/User_Page/Form3Page';
import Form4Page from './pages/User_Page/Form4Page';
import Form5Page from './pages/User_Page/Form5Page';
import Form6Page from './pages/User_Page/Form6Page';
import ExamSubmitPage from './pages/User_Page/ExamSubmitPage';
import ProfilePage from './pages/User_Page/ProfilePage';
import GuidePage from './pages/User_Page/GuidePage';
import TemplatesPage from './pages/User_Page/TemplatesPage'; 

// --- Advisor Pages ---
import MyTasksPage from './pages/Advisor/MyTasksPage'; // ชื่อไฟล์ที่ถูกต้องคือ MyTasksPage

// --- Admin Pages ---
import AdminHomePage from './pages/Admin_Page/AdminHomePage';
import AdminProfilePage from './pages/Admin_Page/AdminProfilePage';
import AdminDocumentDetailPage from './pages/Admin_Page/AdminDocumentDetailPage';
import ManageUsersPage from './pages/Admin_Page/ManageUsersPage';
import ManageStudentDetailPage from './pages/Admin_Page/ManageStudentDetailPage';
import AddStudentPage from './pages/Admin_Page/AddStudentPage'; 
import ManageAdvisorDetailPage from './pages/Admin_Page/ManageAdvisorDetailPage';
// ✅ 1. Import Component หน้าเพิ่มอาจารย์เข้ามา
import AddAdvisorPage from './pages/Admin_Page/AddAdvisorPage';

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Signature ควรเป็นหน้าที่เข้าถึงได้หลัง Login แต่ยังไม่จำเป็นต้องมี Layout เต็ม */}
      <Route path="/signature" element={<SignaturePage />} /> 

      {/* --- Student Routes (Nested under UserLayout) --- */}
      <Route path="/student" element={<UserLayout />}>
        <Route index element={<Navigate replace to="home" />} /> 
        <Route path="home" element={<HomePage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="form1" element={<Form1Page />} />
        <Route path="form2" element={<Form2Page />} />
        <Route path="form3" element={<Form3Page />} />
        <Route path="form4" element={<Form4Page />} />
        <Route path="form5" element={<Form5Page />} />
        <Route path="form6" element={<Form6Page />} />
        <Route path="exam-submit" element={<ExamSubmitPage />} />
        <Route path="docs/:docId" element={<DocumentDetailPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="templates" element={<TemplatesPage />} />
      </Route>
      
      {['advisor', 'program_chair', 'assistant_rector', 'external_professor', 'executive'].map(role => (
        <Route key={role} path={`/${role}`} element={<UserLayout />}>
          <Route index element={<Navigate replace to="home" />} />
          <Route path="home" element={<MyTasksPage />} />
          <Route path="docs/:docId" element={<DocumentDetailPage />} /> 
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      ))}

      {/* --- Admin Routes (Nested under AdminLayout) --- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate replace to="home" />} />
        <Route path="home" element={<AdminHomePage />} />
        <Route path="manage-users" element={<ManageUsersPage />} />
        <Route path="manage-users/student/:studentId" element={<ManageStudentDetailPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="docs/:docId" element={<AdminDocumentDetailPage />} />
      </Route>

    </Routes>
  );
}

export default App;