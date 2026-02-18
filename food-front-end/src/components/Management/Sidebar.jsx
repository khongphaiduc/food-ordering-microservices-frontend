import React from 'react';
import { NavLink } from 'react-router-dom'; // Thêm NavLink để chuyển trang
import { 
  LayoutDashboard, ClipboardList, UtensilsCrossed, 
  Users, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import './SideBar.css';

const Sidebar = ({ role = 'admin', isCollapsed, setIsCollapsed }) => {
  // Cấu hình các item menu, thêm trường 'path' để điều hướng
  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Tổng quan', roles: ['admin'], path: '/management/dashboard' },
    { id: 'orders', icon: <ClipboardList size={20} />, label: 'Đơn hàng', roles: ['admin', 'staff'], path: '/management/orders' },
    { id: 'menu', icon: <UtensilsCrossed size={20} />, label: 'Thực đơn', roles: ['admin'], path: '/management/menu' }, // Đây là mục bạn cần
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
        <div className="logout-btn" onClick={() => {/* Thêm logic logout ở đây */}}>
          <LogOut size={20} />
          {!isCollapsed && <span className="menu-label" style={{color: 'inherit'}}>Đăng xuất</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;