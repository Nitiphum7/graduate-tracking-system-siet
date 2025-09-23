import React, { useState } from 'react'; // ไม่ต้องใช้ useEffect ที่นี่แล้ว เพราะ useAuth จัดการให้
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavbarAdmin.module.css';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../hooks/useAuth'; // ✅ Import useAuth จาก hooks/useAuth
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSitemap, faCog, faUserCircle, faCaretDown, faUserEdit, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


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


function NavbarAdmin() {
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ✅ ดึง user (ไม่ใช่ userData) และ logout จาก useAuth ของคุณ
  // useAuth ของคุณจะคืนค่า { user, token, loading, login, logout, verifyUser }
  const { user, loading, logout } = useAuth(); // ดึง loading มาใช้แสดง 'กำลังโหลด...'

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setMenuOpen(false); 
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout(); // ✅ เรียกฟังก์ชัน logout จาก useAuth
    setIsLogoutModalOpen(false); 
    // useAuth.logout() ควรจะจัดการการล้าง localStorage และ navigate ไปหน้า Login ให้เอง
  };

  // ✅ กำหนดค่าแสดงผลตาม user ที่ได้จาก useAuth และสถานะ loading
  let adminName = 'กำลังโหลด...';
  let adminEmail = 'กำลังโหลด...';

  if (!loading) { // แสดงข้อมูลเมื่อโหลดเสร็จแล้วเท่านั้น
    if (user) {
      // สมมติว่า user object ของคุณมี first_name_th และ last_name_th (หรือชื่ออื่น ๆ)
      // ปรับตามโครงสร้างของ user object ที่มาจาก Backend ของคุณ
      adminName = `${user.first_name_th || ''} ${user.last_name_th || ''}`.trim();
      if (!adminName) { // ถ้าชื่อ-นามสกุลว่าง ให้ใช้ 'ผู้ดูแลระบบ'
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