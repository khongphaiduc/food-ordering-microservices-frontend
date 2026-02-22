import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';
import './Management.css';

const ManagementLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Lấy thông tin từ localStorage
  const name = localStorage.getItem("userName");
  const role = localStorage.getItem("userRole");

  return (
    <div className={`mgmt-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        role="admin" 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      <div className="mgmt-content-wrapper">
        <header className="mgmt-header">

          <div className="marquee-container">
            <div className="marquee-text">
              Hệ thống đặt đồ ăn  FOODLY với kiến trúc Microservices được phát triển bởi Phạm Trung Đức — Chúc bạn một ngày làm việc hiệu quả!
            </div>
          </div>
          
          <div className="mgmt-actions">
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            <div className="profile-divider"></div>
            
            <div className="profile-section">
              <div className="profile-info">
                <span className="profile-name">{name}</span>
                <span className="profile-role">
                  {role === "Admin"
                    ? "Quản trị viên"
                    : role === "Staff"
                    ? "Nhân viên"
                    : role}
                </span>
              </div>
              <div className="avatar-circle">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        <main className="mgmt-main">
          <div className="mgmt-page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagementLayout;