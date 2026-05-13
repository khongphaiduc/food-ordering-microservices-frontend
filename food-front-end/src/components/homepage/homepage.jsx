import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard';
import ShoppingCart from './CartDrawer'; 
import './home.css';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerActive, setIsDrawerActive] = useState(false);
   const apiUrl = import.meta.env.VITE_API_URL;
  // State quản lý Menu User
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // State quản lý Modal địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    phone: '', city: '', line1: '', line2: '', district: 'None'
  });

  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-nav-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // 1. Kiểm tra địa chỉ khi vào trang
  useEffect(() => {
    const checkUserAddress = async () => {
      if (!token || !userId) return;
      try {
        const response = await fetch(`${apiUrl}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const userData = await response.json();
          if (!userData.addressUsers || userData.addressUsers.length === 0) {
            setShowAddressModal(true);
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra địa chỉ:", err);
      }
    };
    checkUserAddress();
  }, [token, userId]);

  // 2. Lấy danh sách sản phẩm (Đã sửa theo payload mới)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products/ai`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        
        if (data?.list && Array.isArray(data.list)) {
          const mappedFoods = data.list.map(f => {
            // Lấy URL ảnh chính từ mảng imageFoods
            const mainImg = f.imageFoods?.find(img => img.isMain)?.urlImage 
                          || f.imageFoods?.[0]?.urlImage 
                          || 'https://via.placeholder.com/300';

            return {
              id: f.id, 
              name: f.name,
              desc: f.decriptions, // Map đúng key 'decriptions' từ API
              price: f.price || 0,
              img: mainImg,
              featured: f.price >= 100000 // Ví dụ: Gán nhãn Nổi bật cho món > 100k
            };
          });
          setFoods(mappedFoods);
        }
      } catch (err) { 
        console.error("Lỗi kết nối API:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, [token]);

  // 3. Xử lý cập nhật địa chỉ
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      const response = await fetch(`${apiUrl}/users/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          IdUser: userId,
          Phone: addressData.phone,
          City: addressData.city,
          Line1: addressData.line1,
          Line2: addressData.line2,
          District: addressData.district,
          IsDefault: true
        })
      });
      if (response.ok) {
        setShowAddressModal(false);
        alert("Cập nhật địa chỉ thành công! Chúc mừng năm mới 🧧");
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
    } finally {
      setSubmittingAddress(false);
    }
  };

  // 4. Sự kiện giỏ hàng
  useEffect(() => {
    const handleCartState = (e) => setIsDrawerActive(e.detail.isOpen);
    window.addEventListener('cartStateChanged', handleCartState);
    return () => window.removeEventListener('cartStateChanged', handleCartState);
  }, []);

  const handleOpenCart = () => window.dispatchEvent(new Event('openCart'));
  
  const featuredFoods = foods.filter(f => f.featured);

  return (
    <div className="page-root tet-mode">
      
      {/* MODAL CẬP NHẬT ĐỊA CHỈ */}
      {showAddressModal && (
        <div className="address-overlay">
          <div className="address-modal">
            <div className="modal-header-icon">🧧</div>
            <h3>Khai Xuân Hoàn Tất Thông Tin</h3>
            <p>Để nhận lộc xuân, bạn vui lòng cập nhật địa chỉ giao hàng nhé!</p>
            
            <form onSubmit={handleUpdateAddress} className="modal-address-form">
              <input type="text" placeholder="Số điện thoại nhận hàng" required 
                onChange={e => setAddressData({...addressData, phone: e.target.value})} />
              <input type="text" placeholder="Tỉnh / Thành phố" required 
                onChange={e => setAddressData({...addressData, city: e.target.value})} />
              <input type="text" placeholder="Địa chỉ (Số nhà, đường...)" required 
                onChange={e => setAddressData({...addressData, line1: e.target.value})} />
              <input type="text" placeholder="Phường / Xã" required 
                onChange={e => setAddressData({...addressData, line2: e.target.value})} />
              <button type="submit" className="btn-modal-submit" disabled={submittingAddress}>
                {submittingAddress ? "Đang lưu..." : "Xác nhận & Tiếp tục 🧨"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hiệu ứng hoa đào */}
      <div className="tet-decoration-layer">
        {[...Array(8)].map((_, i) => <span key={i} className="flower">🌸</span>)}
      </div>

      <header className="topbar">
        <div className="logo" style={{color: '#d32f2f'}}>
          TRUNGDUCFOODLY<span className="tet-sub">.Tết Đoàn Viên</span>
        </div>
        
        <nav className="nav-links">
          <Link to="/menu">Thực đơn Tết</Link>
          
          {userName ? (
            <div className="user-nav-container">
              <div className={`user-badge-main ${showUserMenu ? 'active' : ''}`} onClick={() => setShowUserMenu(!showUserMenu)}>
                <span>Chào Duc, <strong>{userName}</strong> 🧧</span>
                <span className={`arrow ${showUserMenu ? 'up' : ''}`}>▾</span>
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-link">👤 Hồ sơ cá nhân</Link>
                  <Link to="/orders" className="dropdown-link">🛍️ Đơn của bạn</Link>
                  <div className="divider"></div>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-logout-item">
                    🚪 Thoát tài khoản
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-login" style={{borderColor: '#d32f2f', color: '#d32f2f'}}>
              Đăng nhập
            </Link>
          )}

          <button className={`cart-header-btn ${isDrawerActive ? 'hidden' : ''}`} onClick={handleOpenCart}>
            <span className="cart-icon">🧧</span>
          </button>
        </nav>
      </header>

      <section className="hero">
        <h1>
          <span className="slide-left">Tết Trọn Vị Ngon,</span>
          <span className="slide-right">
            Giao Hàng <span style={{ color: '#d32f2f' }}>Tốc Biến</span>
          </span>
        </h1>
        <p className="fade-in" style={{textAlign: 'center', marginTop: '-10px', color: '#718096'}}>
          🧧 Ưu đãi khai xuân - Giảm 20% cho mọi đơn hàng 🧧
        </p>
      </section>


      {/* THỰC ĐƠN CHÍNH */}
      <section id="menu">
        <h2 className="section-title">Top món ăn gợi ý dành riêng cho bạn .</h2>
        {loading ? ( 
          <p style={{ textAlign: 'center' }}>Đang chuẩn bị mâm cỗ...</p> 
        ) : (
          <>
            <div className="grid">
              {foods.map(food => (
                <FoodCard key={food.id} food={food} onAdd={handleOpenCart} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '20px' }}>
              <Link to="/menu" className="btn-show-more-link">
                Xem thêm món ăn 🧧
              </Link>
            </div>
          </>
        )}
      </section>

      <div className={`fixed-nav-group ${isDrawerActive || showAddressModal ? 'hidden' : ''}`}>
        <button className="nav-floating-btn cart" onClick={handleOpenCart} style={{backgroundColor: '#d32f2f'}}>
          <span className="icon">🧧</span>
          <span className="label">Lộc Xuân</span>
        </button>
      </div>

      <ShoppingCart />

      <footer style={{ padding: '60px', textAlign: 'center', color: '#d32f2f', background: '#fffaf0', borderTop: '1px solid #fee2e2' }}>
        © 2026 Foodly — Phạm Trung Đức - Chúc Mừng Năm Mới 🧨
      </footer>
    </div>
  );
}