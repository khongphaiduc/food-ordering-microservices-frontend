import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './profile.css';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    phone: '', city: '', line1: '', line2: '', district: ''
  });
 const apiUrl = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUserData(await res.json());
    } catch (err) {
      console.error("Lỗi tải profile:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/users/address`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          ...addressForm, 
          IdUser: userId, 
          IsDefault: userData?.addressUsers?.length === 0 
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchProfile();
        alert("Thêm địa chỉ thành công! 🧧");
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Đang tải thông tin... 🌸</div>;

  return (
    <div className="profile-page tet-mode">
      <div className="profile-container">
        <Link to="/" className="back-link">← Quay lại trang chủ</Link>
        
        <div className="profile-card">
          <div className="user-info-section">
            <div className="avatar-circle">🧧</div>
            <h2>{userData?.name || "Người dùng Foodly"}</h2>
            <p className="user-email">{userData?.email}</p>
            <div className="user-meta-tags">
              <span className="meta-tag">📞 {userData?.phone || "Chưa cập nhật SĐT"}</span>
            </div>
          </div>

          <div className="address-section">
            <div className="section-header">
              <h3>Địa chỉ của tôi</h3>
              <button className="btn-add-address" onClick={() => setShowModal(true)}>
                + Thêm địa chỉ mới
              </button>
            </div>
            
            <div className="address-list">
              {userData?.addressUsers?.length > 0 ? (
                userData.addressUsers.map((addr, i) => (
                  <div key={i} className={`address-item-card ${addr.isDefault ? 'active' : ''}`}>
                    <div className="address-info">
                      <p className="addr-phone"><strong>{addr.phone}</strong></p>
                      {/* Hiển thị tất cả trên 1 dòng */}
                      <p className="addr-full-line">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                        {addr.district ? `, ${addr.district}` : ''}
                        {addr.city ? `, ${addr.city}` : ''}
                      </p>
                    </div>
                    {addr.isDefault && <span className="default-badge">Mặc định</span>}
                  </div>
                ))
              ) : (
                <div className="empty-address">Bạn chưa lưu địa chỉ nào.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="address-overlay">
          <div className="address-modal scale-in">
            <div className="modal-header-icon">📍</div>
            <h3>Thêm địa chỉ mới</h3>
            <p className="modal-subtitle">Nhập thông tin giao hàng</p>
            
            <form onSubmit={handleAddAddress} className="modal-address-form">
              <input type="text" placeholder="Số điện thoại" required 
                onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              
              <div className="input-row">
                <input type="text" placeholder="Tỉnh / Thành phố" required 
                  onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                <input type="text" placeholder="Quận / Huyện" required 
                  onChange={e => setAddressForm({...addressForm, district: e.target.value})} />
              </div>

              <input type="text" placeholder="Số nhà, đường (Line 1)" required 
                onChange={e => setAddressForm({...addressForm, line1: e.target.value})} />
              
              <input type="text" placeholder="Phường / Xã (Line 2)" required 
                onChange={e => setAddressForm({...addressForm, line2: e.target.value})} />
              
              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu địa chỉ 🧧"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}