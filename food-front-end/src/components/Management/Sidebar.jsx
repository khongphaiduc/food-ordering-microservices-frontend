import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BrandLogo from '../homepage/BrandLogo';
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed,
  Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Boxes, PlusCircle, Search, PackagePlus,
  Sparkles, ChefHat, User
} from 'lucide-react';
import './SideBar.css';


const Sidebar = ({ role: roleProp = 'admin', isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem('userId') || 'd4011506-1c9b-4b86-be2c-1e6bc9d7d707';
  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') || 'Admin';

  const role = (userRole.toLowerCase() === 'admin' || roleProp === 'admin') ? 'admin' : 'staff';

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '🧧 Đăng xuất khỏi hệ thống?',
      text: 'Chúc bạn một năm mới An Khang Thịnh Vượng! Bạn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại',
      background: '#3f0713',
      color: '#fef08a',
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${apiUrl}/auth/logout?id=${userId}`);
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
      } finally {
        localStorage.clear();
        navigate('/home');
        Swal.fire({
          title: '🌸 Hẹn gặp lại bạn!',
          text: 'Đã đăng xuất an toàn.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#3f0713',
          color: '#fef08a'
        });
      }
    }
  };

  const menuGroups = [
    {
      title: '🌸 TỔNG QUAN',
      items: [
        {
          id: 'overview',
          icon: <LayoutDashboard size={18} />,
          label: 'Tổng quan',
          roles: ['admin', 'staff'],
          path: '/management/dashboard'
        },
      ]
    },
    {
      title: ' KINH DOANH & MÓN ĂN',
      items: [
        {
          id: 'orders',
          icon: <ClipboardList size={18} />,
          label: 'Quản lý đơn hàng',
          roles: ['admin', 'staff'],
          path: '/management/orders',

          badgeType: 'tet-gold'
        },
        {
          id: 'menu',
          icon: <UtensilsCrossed size={18} />,
          label: 'Quản lý thực đơn',
          roles: ['admin'],
          path: '/management/menu',

          badgeType: 'tet-red'
        },
        {
          id: 'add-product',
          icon: <PlusCircle size={18} />,
          label: 'Thêm món ăn mới',
          roles: ['admin'],
          path: '/management/product/add',

          badgeType: 'tet-glow'
        },
      ]
    },
    {
      title: '📦 KHO & VẬT TƯ',
      items: [
        {
          id: 'inventory',
          icon: <Boxes size={18} />,
          label: 'Kho hàng',
          roles: ['admin'],
          path: '/management/inventory'
        },
        {
          id: 'create-inventory',
          icon: <PackagePlus size={18} />,
          label: 'Nhập kho hàng',
          roles: ['admin'],
          path: '/management/inventory/create'
        },
      ]
    },
    {
      title: '⚙️ HỆ THỐNG',
      items: [
        {
          id: 'staff',
          icon: <Users size={18} />,
          label: 'Quản lý nhân viên',
          roles: ['admin'],
          path: '/management/staff'
        },
        {
          id: 'settings',
          icon: <Settings size={18} />,
          label: 'Cài đặt hệ thống',
          roles: ['admin', 'staff'],
          path: '/management/settings'
        },
      ]
    }
  ];

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Brand Header */}
      <div className="sidebar-logo-container">
        <div className="logo-brand-group">
          <BrandLogo size="small" />
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle-btn"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Admin User Card Summary */}
      <div className="sidebar-user-card">
        <div className="user-avatar-wrapper">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <span className="user-online-indicator" title="Đang hoạt động"></span>
        </div>
        {!isCollapsed && (
          <div className="user-card-details">
            <div className="user-name-row">
              <span className="user-card-name" title={userName}>{userName}</span>

            </div>
            <span className="user-card-role">
              {role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Search Bar (When Expanded) */}
      {!isCollapsed && (
        <div className="sidebar-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm chức năng Tết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIdx) => {
          const filteredItems = group.items.filter(item => {
            const hasRole = item.roles.includes(role);
            const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
            return hasRole && matchesSearch;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={groupIdx} className="nav-group">
              {!isCollapsed && (
                <div className="group-header">
                  <span>{group.title}</span>
                </div>
              )}
              {isCollapsed && groupIdx > 0 && <div className="group-divider"></div>}

              <div className="group-items">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="menu-item-wrapper"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                    >
                      <div className="menu-icon">{item.icon}</div>

                      {!isCollapsed && (
                        <>
                          <span className="menu-label">{item.label}</span>
                          {item.badge && (
                            <span className={`menu-badge badge-${item.badgeType || 'tet-gold'}`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight size={14} className="menu-active-chevron" />
                        </>
                      )}
                    </NavLink>

                    {/* Floating Tooltip for Collapsed Mode */}
                    {isCollapsed && hoveredItem === item.id && (
                      <div className="collapsed-tooltip">
                        <span className="tooltip-title">{item.label}</span>
                        <span className="tooltip-category">{group.title}</span>
                        {item.badge && (
                          <span className={`tooltip-badge badge-${item.badgeType || 'tet-gold'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer & Logout */}
      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <span className="status-dot"></span>
          {!isCollapsed && <span className="status-text">🌸 Xuân Ất Tỵ • Online</span>}
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="logout-text">Đăng xuất Tết</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


