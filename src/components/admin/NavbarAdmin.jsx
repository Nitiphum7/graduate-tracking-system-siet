import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './NavbarAdmin.module.css';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSitemap, faCog, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// Modal สำหรับยืนยันการออกจากระบบ
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3>ยืนยันการออกจากระบบ</h3>
        <p>คุณต้องการที่จะออกจากระบบใช่หรือไม่?</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            ยกเลิก
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
function NavbarAdmin() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // ✅ ดึง user, loading, และ logout จาก useAuth
  const { user, loading, logout } = useAuth();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setMenuOpen(false); 
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout(); // ✅ เรียกฟังก์ชัน logout จาก useAuth
    setIsLogoutModalOpen(false); 
    // useAuth.logout() จะจัดการการล้าง localStorage และ navigate ไปหน้า Login เอง
  };

  // ✅ แสดงข้อความ "กำลังโหลด..." ระหว่างรอข้อมูล
  let adminName = 'กำลังโหลด...';
  let adminEmail = 'กำลังโหลด...';

  if (!loading) { 
    if (user) {
      // ปรับตามโครงสร้าง user object ที่ได้จาก Backend
      adminName = `${user.first_name_th || ''} ${user.last_name_th || ''}`.trim();
      if (!adminName) {
        adminName = 'ผู้ดูแลระบบ';
      }
      adminEmail = user.email || '';
    } else {
      adminName = 'Guest';
      adminEmail = '';
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/admin/home" className={styles.logoLink}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo" />
            <span>Graduate Tracking System (Admin)</span>
          </div>
        </Link>
        <ul className={styles.navLinks}>
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
          <a href="#" onClick={(e) => e.preventDefault()} className={styles.userProfileLink}>
            <div className={styles.userNameContainer}>
              <span className={styles.userName}>{adminName}</span>
              <span className={styles.userEmail}>{adminEmail}</span>
            </div>
            <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
            <FontAwesomeIcon icon={faCaretDown} className={styles.caretIcon} /> 
          </a>
          {isMenuOpen && (
            <ul className={styles.dropdownMenu}>
              <li><Link to="/admin/profile"><FontAwesomeIcon icon={faUserEdit} /> จัดการโปรไฟล์</Link></li>
              <li><a href="#" onClick={handleLogoutClick}><FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ</a></li>
            </ul>
          )}
        </div>
      </nav>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export default NavbarAdmin;

