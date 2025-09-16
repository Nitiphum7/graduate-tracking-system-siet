import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/images/logo.png'; // ตรวจสอบ Path ของ logo ให้ถูกต้อง

import { useAuth } from '../hooks/useAuth'; // <-- 1. Import useAuth เข้ามา

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faFileAlt, faEdit, faCaretDown, faLanguage, 
  faDownload, faBookOpen, faUserCircle, faUserEdit, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const { user, logout, loading } = useAuth(); // <-- 2. ดึงข้อมูล user และฟังก์ชัน logout จาก Context
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // เรียกใช้ฟังก์ชัน logout จาก context
        navigate('/login');
    };

    // --- ส่วนแสดงผลหลัก ---
    return (
        <nav className={styles.navbar}>
            <Link to={user ? `/${user.role}/home` : '/login'} className={styles.logoLink}>
                <div className={styles.logo}>
                    <img src={logo} alt="KMITL Logo" />
                    <span>Graduate Tracking System</span>
                </div>
            </Link>

            {/* แสดงเมนูหลักต่อเมื่อผู้ใช้ล็อกอินแล้วเท่านั้น */}
            {user && (
                <ul className={styles.navLinks}>
                    <li><NavLink to={`/${user.role}/home`} className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
                    <li><NavLink to="/student/status" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faFileAlt} /> สถานะเอกสาร</NavLink></li>
                    
                    <li className={styles.dropdown}>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            <FontAwesomeIcon icon={faEdit} /> กรอกแบบฟอร์ม <FontAwesomeIcon icon={faCaretDown} />
                        </a>
                        <ul className={styles.dropdownMenu}>
                            <li className={styles.dropdownHeader}>ขั้นการสอบหัวข้อและเค้าโครง</li>
                            <li><Link to="/student/form1">แบบฟอร์มขอรับรองการเป็นอาจารย์ที่ปรึกษาวิทยานิพนธ์ หลัก/ร่วม</Link></li>
                            <li><Link to="/student/form2">แบบเสนอหัวข้อและเค้าโครงวิทยานิพนธ์ ระดับบัณฑิตศึกษา</Link></li>
                            <li><Link to="/student/form3">แบบนำส่งเอกสารหัวข้อและเค้าโครงวิทยานิพนธ์ 1 เล่ม</Link></li>
                            <li><Link to="/student/form4">แแบบขอหนังสือเชิญเป็นผู้ทรงคุณวุฒิตรวจและประเมิน...เพื่อการวิจัย</Link></li>
                            <li><Link to="/student/form5">แบบขอหนังสือขออนุญาตเก็บรวบรวมข้อมูล (วิทยานิพนธ์)</Link></li>
                            <li className={styles.dropdownDivider}></li>
                            <li className={styles.dropdownHeader}>ขั้นการสอบวิทยานิพนธ์ขั้นสุดท้าย</li>
                            <li><Link to="/student/form6">บันทึกข้อความ เรื่อง ขอแต่งตั้งคณะกรรมการ</Link></li>
                        </ul>
                    </li>
                    
                    <li><NavLink to="/student/eng" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faLanguage} /> ยื่นคะแนนสอบ</NavLink></li>
                    <li><NavLink to="/student/templates" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faDownload} /> ดาวน์โหลดเอกสาร</NavLink></li>
                    <li><NavLink to="/student/guide" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faBookOpen} /> คู่มือการใช้งาน</NavLink></li>
                </ul>
            )}

            {/* --- ส่วนโปรไฟล์ผู้ใช้ (User Menu) --- */}
            <div className={styles.userMenu}>
                {loading ? (
                    <span>กำลังโหลด...</span>
                ) : user ? (
                    <>
                        <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
                            <div className={styles.userNameContainer}>
                                <span className={styles.userName}>{`${user.prefix_th || ''}${user.first_name_th || ''}`}</span>
                                <span className={styles.userEmail}>{user.email}</span>
                            </div>
                            <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
                            <FontAwesomeIcon icon={faCaretDown} />
                        </a>
                        <ul className={`${styles.dropdownMenu} ${styles.userDropdownMenu}`}>
                            <li className={styles.userInfoHeader}>
                                <div className={styles.infoDetail}>
                                    <strong>{user.role === 'student' ? 'รหัสนักศึกษา:' : 'รหัสอาจารย์:'}</strong>
                                    <span>{user.student_id || user.advisor_id || 'N/A'}</span>
                                </div>
                                <div className={styles.infoDetail}>
                                    <strong>ชื่อ-นามสกุล:</strong>
                                    <span>{`${user.prefix_th || ''}${user.first_name_th || ''} ${user.last_name_th || ''}`}</span>
                                </div>
                            </li>
                            <li className={styles.dropdownDivider}></li>
                            <li><Link to="/student/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
                            <li><a href="#" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
                        </ul>
                    </>
                ) : (
                    <Link to="/login" className={styles.loginLink}>เข้าสู่ระบบ</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;