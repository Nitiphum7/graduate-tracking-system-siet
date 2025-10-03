import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 

// --- Layouts ---
import UserLayout from './layouts/UserLayout'; 
import AdminLayout from './layouts/AdminLayout';
import FullWidthLayout from './layouts/FullWidthLayout';

// --- Public Pages ---
import LoginPage from './pages/Auth_Page/Login';
import SignaturePage from './pages/User_Page/SignaturePage';

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

// --- NEW IMPORT: หน้าแก้ไขเอกสาร (ที่สร้างขึ้นใหม่) ---
import EditDocumentPage from './pages/User_Page/EditDocumentPage'; 

// --- Advisor Pages ---
import MyTasksPage from './pages/Advisor/MyTasksPage';
import MyTaksProfilePage from './pages/Advisor/MyTaksProfilePage'
import MyRolesPage from './pages/Advisor/MyRolesPage';

// --- Admin Pages ---
import AdminHomePage from './pages/Admin_Page/AdminHomePage';
import AdminProfilePage from './pages/Admin_Page/AdminProfilePage';
import AdminDocumentDetailPage from './pages/Admin_Page/AdminDocumentDetailPage';
import ManageUsersPage from './pages/Admin_Page/ManageUsersPage';
import ManageStudentDetailPage from './pages/Admin_Page/ManageStudentDetailPage';
import ManageAdvisorDetailPage from './pages/Admin_Page/ManageAdvisorDetailPage';
import AddStudentPage from './pages/Admin_Page/AddStudentPage'; 
import AddAdvisorPage from './pages/Admin_Page/AddAdvisorPage';
import ManageStructuresPage from './pages/Admin_Page/ManageStructuresPage';
import SettingsPage from './pages/Admin_Page/SettingsPage';


function App() {
  return (
  <AuthProvider>
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* --- All Protected Routes --- */}
      <Route element={<ProtectedRoute />}> 

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

            {/* **ROUTE ที่เพิ่ม/ย้ายเข้ามา** */}
          <Route path="edit-doc/:docId" element={<EditDocumentPage />} />
        </Route>
        
        {/* --- Advisor & other roles Routes (Nested under UserLayout) --- */}
        {['advisor', 'program_chair', 'assistant_rector', 'external_professor', 'executive'].map(role => (
          <Route key={role} path={`/${role}`} element={<UserLayout />}>
            <Route index element={<Navigate replace to="home" />} />
            <Route path="home" element={<MyTasksPage />} />
            <Route path="docs/:docId" element={<DocumentDetailPage />} /> 
            <Route path="profile" element={<MyTaksProfilePage />} />
            <Route path="my-roles" element={<MyRolesPage />} />
          </Route>
        ))}

        {/* --- Admin Routes --- */}
        {/* 👇 ส่วนของ Admin ที่จะมี Sidebar แสดงผล (ใช้ AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate replace to="home" />} />
            <Route path="home" element={<AdminHomePage />} />

            <Route path="manage-users" element={<ManageUsersPage />}>
                <Route index element={<Navigate replace to="overview" />} /> 
                <Route path="overview" element={<div>Overview Content</div>} /> 
                <Route path="students" element={<div>Student Table Content</div>} /> 
                <Route path="advisors" element={<div>Advisor Table Content</div>} /> 
            </Route>

            <Route path="manage-users/student/new" element={<AddStudentPage />} />
            <Route path="manage-users/advisor/new" element={<AddAdvisorPage />} />
            <Route path="manage-users/student/:studentId" element={<ManageStudentDetailPage />} />
            <Route path="manage-users/advisor/:advisorId" element={<ManageAdvisorDetailPage />} />
          
            <Route path="docs/:docId" element={<AdminDocumentDetailPage />} />
        </Route>

        {/* 👇 ส่วนของ Admin ที่จะแสดงผลเต็มหน้าจอ (ใช้ FullWidthLayout) */}
        <Route element={<FullWidthLayout />}>
          <Route path="/admin/structures" element={<ManageStructuresPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

      </Route>

    </Routes>
</AuthProvider>
  );
}

export default App;
