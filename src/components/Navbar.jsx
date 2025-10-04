import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/images/logo.png';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faFileAlt, faEdit, faCaretDown, faLanguage, 
  faDownload, faBookOpen, faUserCircle, faUserEdit, faSignOutAlt,
  faTachometerAlt, faUsersCog, faTasks 
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderNavLinks = () => {
        if (!user) return null;

        switch (user.role_name) {
            case 'student':
                return (
                    <ul className={styles.navLinks}>
                        <li><NavLink to="/student/home" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
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
                        
                        <li><NavLink to="/student/exam-submit" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faLanguage} /> ยื่นคะแนนสอบ</NavLink></li>
                        <li><NavLink to="/student/templates" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faDownload} /> ดาวน์โหลดเอกสาร</NavLink></li>
                        <li><NavLink to="/student/guide" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faBookOpen} /> คู่มือการใช้งาน</NavLink></li>
                    </ul>
                );
            case 'admin':
                return (
                    <ul className={styles.navLinks}>
                        <li><NavLink to="/admin/home" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faTachometerAlt} /> แดชบอร์ด</NavLink></li>
                        <li><NavLink to="/admin/documents" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faTasks} /> จัดการเอกสาร</NavLink></li>
                        <li><NavLink to="/admin/users" className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faUsersCog} /> จัดการผู้ใช้งาน</NavLink></li>
                    </ul>
                );
            // ✅ Handles other roles like 'advisor', 'program_chair' etc.
            default:
                return (
                     <ul className={styles.navLinks}>
                         <li><NavLink to={`/${user.role_name}/home`} className={({ isActive }) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
                        {user.role_name === 'advisor' && (
                            <li><NavLink to="/advisor/my-roles" className={({ isActive }) => isActive ? styles.active : ''}>
                                    <FontAwesomeIcon icon={faUsersCog} /> บทบาท
                                </NavLink>
                            </li>
                        )}
                     </ul>
                );
        }
    }

    return (
        <nav className={styles.navbar}>
            <Link to={user ? `/${user.role_name}/home` : '/login'} className={styles.logoLink}>
                <div className={styles.logo}>
                    <img src={logo} alt="KMITL Logo" />
                    {/* ✅ Display role in title for clarity during development */}
                    <span>Graduate Tracking System {user ? `(${user.role_name})` : ''}</span>
                </div>
            </Link>

            {renderNavLinks()}

            <div className={styles.userMenu}>
                {loading ? (
                    <span>Loading...</span>
                ) : user && user.email ? (
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
                                    {/* ✅ Improved logic to show relevant ID */}
                                    <strong>{user.role_name === 'student' ? 'รหัสนักศึกษา:' : 'Role:'}</strong>
                                    <span>{user.student_id || user.advisor_id || user.role_name}</span>
                                </div>
                                <div className={styles.infoDetail}>
                                    <strong>ชื่อ-นามสกุล:</strong>
                                    <span>{`${user.prefix_th || ''}${user.first_name_th || ''} ${user.last_name_th || ''}`}</span>
                                </div>
                            </li>
                            <li className={styles.dropdownDivider}></li>
                            {/* ✅ Dynamic link to profile page based on role */}
                            <li><Link to={`/${user.role_name}/profile`}><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
                            <li><a href="#" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
                        </ul>
                    </>
                ) : (
                    <Link to="/login" className={styles.loginLink}>Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;