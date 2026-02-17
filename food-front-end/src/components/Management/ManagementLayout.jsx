import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import './Management.css'; // Import file CSS riêng của bạn

const ManagementLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mgmt-container">
      <Sidebar role="admin" isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="mgmt-content-wrapper">
        <header className="mgmt-header">
          <div className="search-container">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input 
              className="search-input" 
              placeholder="Tìm trong trang quản lý..." 
            />
          </div>
          
          <div className="mgmt-actions">
            <button className="notification-btn">
              <Bell size={22} />
              <span className="notification-badge">3</span>
            </button>
            <div className="profile-section">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">Đức Phạm</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="avatar-circle">D</div>
            </div>
          </div>
        </header>

        <main className="mgmt-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagementLayout;