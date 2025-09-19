import React, { useState } from 'react'; // ❌ ไม่ต้องใช้ useEffect แล้ว
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavbarAdmin.module.css';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../hooks/useAuth'; // ✅ 1. Import useAuth เข้ามา
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSitemap, faCog, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function NavbarAdmin() {
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);
  
  // ✅ 2. เปลี่ยนมาใช้ State จาก AuthContext โดยตรง
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    // ใช้ฟังก์ชัน logout จาก Context เพื่อความสมบูรณ์ของระบบ
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/admin/home" className={styles.logoLink}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" />
          <span>Graduate Tracking System (Admin)</span>
        </div>
      </Link>
      <ul className={styles.navLinks}>
        {/* ส่วนของ NavLink เหมือนเดิม */}
        <li><NavLink to="/admin/home" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faHome} /> หน้าหลัก</NavLink></li>
        <li><NavLink to="/admin/manage-users" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faUsersCog} /> จัดการผู้ใช้งาน</NavLink></li>
        <li><NavLink to="/admin/structures" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faSitemap} /> จัดการโครงสร้าง</NavLink></li>
        <li><NavLink to="/admin/settings" className={({isActive}) => isActive ? styles.active : ''}><FontAwesomeIcon icon={faCog} /> ตั้งค่าระบบ</NavLink></li>
      </ul>
      
      <div 
        className={styles.userMenu}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {/* ✅ 3. ใช้ Logic การแสดงผลที่ถูกต้องจาก AuthContext */}
        {loading ? (
            <span className={styles.loadingText}>Admin Loading...</span>
        ) : user ? (
            <>
                <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
                  <div className={styles.userNameContainer}>
                    <span className={styles.userName}>{`${user.prefix_th || 'Admin'} ${user.first_name_th || ''}`.trim()}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
                  <FontAwesomeIcon icon={faCaretDown} className={styles.caretIcon} /> 
                </a>
                {isMenuOpen && (
                  <ul className={styles.dropdownMenu}>
                    <li><Link to="/admin/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
                    <li><a href="#" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
                  </ul>
                )}
            </>
        ) : (
            <Link to="/login" className={styles.loginLink}>เข้าสู่ระบบ</Link>
        )}
      </div>
    </nav>
  );
}
export default NavbarAdmin;