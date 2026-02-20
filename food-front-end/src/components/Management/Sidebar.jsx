import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import axios from 'axios'; // Đảm bảo đã cài đặt axios: npm install axios
import { 
  LayoutDashboard, ClipboardList, UtensilsCrossed, 
  Users, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import './SideBar.css';

const Sidebar = ({ role = 'admin', isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  // Giả sử bạn lưu thông tin user trong localStorage sau khi login
  // Bạn cần thay đổi dòng này để khớp với cách bạn lưu trữ userId
  const userId = localStorage.getItem('userId') || 'd4011506-1c9b-4b86-be2c-1e6bc9d7d707'; 

  const handleLogout = async () => {
    try {
      // 1. Gọi API đăng xuất
      await axios.post(`https://localhost:7150/auth/logout?id=${userId}`);

      // 2. Xóa dữ liệu phiên làm việc (Token, User Info)
      localStorage.clear(); // Hoặc xóa cụ thể: localStorage.removeItem('token');

      // 3. Chuyển hướng về trang đăng nhập
      navigate('/home');
      
      console.log('Đăng xuất thành công');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
     
      localStorage.clear();
      navigate('/home');
    }
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Tổng quan', roles: ['admin'], path: '/management/dashboard' },
    { id: 'orders', icon: <ClipboardList size={20} />, label: 'Đơn hàng', roles: ['admin', 'staff'], path: '/management/orders' },
    { id: 'menu', icon: <UtensilsCrossed size={20} />, label: 'Thực đơn', roles: ['admin'], path: '/management/menu' },
    { id: 'staff', icon: <Users size={20} />, label: 'Nhân viên', roles: ['admin'], path: '/management/staff' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt', roles: ['admin', 'staff'], path: '/management/settings' },
  ];

  return (
    <div className={`sidebar-container ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="sidebar-logo">
        <span className="logo-text">{isCollapsed ? 'F.' : 'FOODLY'}</span>
      </div>

      <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-btn">
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="sidebar-nav">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => (
            <NavLink 
              key={item.id} 
              to={item.path} 
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            >
              <div className="menu-icon">{item.icon}</div>
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-footer">
        {/* Gọi hàm handleLogout khi click */}
        <div className="logout-btn" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogOut size={20} />
          {!isCollapsed && <span className="menu-label" style={{color: 'inherit'}}>Đăng xuất</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;