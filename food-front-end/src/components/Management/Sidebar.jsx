import React from 'react';
import { 
  LayoutDashboard, ClipboardList, UtensilsCrossed, 
  Users, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import './SideBar.css'; // Import file CSS vừa tạo

const Sidebar = ({ role = 'admin', isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Tổng quan', roles: ['admin'] },
    { id: 'orders', icon: <ClipboardList size={20} />, label: 'Đơn hàng', roles: ['admin', 'staff'] },
    { id: 'menu', icon: <UtensilsCrossed size={20} />, label: 'Thực đơn', roles: ['admin'] },
    { id: 'staff', icon: <Users size={20} />, label: 'Nhân viên', roles: ['admin'] },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt', roles: ['admin', 'staff'] },
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
        {menuItems.filter(item => item.roles.includes(role)).map((item) => (
          <div key={item.id} className="menu-item">
            <div className="menu-icon">{item.icon}</div>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="logout-btn">
          <LogOut size={20} />
          {!isCollapsed && <span className="menu-label" style={{color: 'inherit'}}>Đăng xuất</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;