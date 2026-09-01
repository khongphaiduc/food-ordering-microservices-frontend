import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard';
import BrandLogo from './BrandLogo';
import FireworksEffect from './FireworksEffect';
import banhTrungImg from '../../assets/banhtrung.avif';
import sideLeftImg from '../../assets/sideleft.webp';
import vienTextImg from '../../assets/VienText.png';
import './home.css';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerActive, setIsDrawerActive] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // 5. Hiệu ứng cuộn kể câu chuyện (Scroll Storytelling Reveal Effect)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(
      '.reveal-on-scroll, .grand-pillar-item'
    );
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [loading, foods]);

  const handleOpenCart = () => window.dispatchEvent(new Event('openCart'));

  const handleQuickAddToCart = async (foodItem) => {
    if (!userId || !token) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }
    try {
      const cartRes = await axios.get(`${apiUrl}/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const idCart = cartRes.data.idCart;
      let currentItems = cartRes.data.cartItems || [];
      const existingIndex = currentItems.findIndex(it => it.idProduct === foodItem.id);
      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += 1;
      } else {
        currentItems.push({ idProduct: foodItem.id, idVariant: null, quantity: 1 });
      }

      await axios.post(`${apiUrl}/cart/update-cart`, {
        IdCart: idCart,
        CartItems: currentItems.map(it => ({
          ProductId: it.idProduct,
          VariantId: it.idVariant || null,
          Quantity: it.quantity
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('openCart'));
    } catch (e) {
      console.error("Lỗi thêm vào giỏ hàng:", e);
      alert("Không thể thêm vào giỏ hàng, vui lòng thử lại!");
    }
  };

  const featuredFoods = foods.filter(f => f.featured);

  return (
    <div className="page-root tet-mode">

      {/* MODAL CẬP NHẬT ĐỊA CHỈ */}
      {showAddressModal && (
        <div className="address-overlay">
          <div className="address-modal">
            <div className="modal-header-icon">
              <img src={banhTrungImg} alt="Bánh Chưng" className="banh-trung-icon-img" />
            </div>
            <h3>Khai Xuân Hoàn Tất Thông Tin</h3>
            <p>Để nhận lộc xuân, bạn vui lòng cập nhật địa chỉ giao hàng nhé!</p>

            <form onSubmit={handleUpdateAddress} className="modal-address-form">
              <input type="text" placeholder="Số điện thoại nhận hàng" required
                onChange={e => setAddressData({ ...addressData, phone: e.target.value })} />
              <input type="text" placeholder="Tỉnh / Thành phố" required
                onChange={e => setAddressData({ ...addressData, city: e.target.value })} />
              <input type="text" placeholder="Địa chỉ (Số nhà, đường...)" required
                onChange={e => setAddressData({ ...addressData, line1: e.target.value })} />
              <input type="text" placeholder="Phường / Xã" required
                onChange={e => setAddressData({ ...addressData, line2: e.target.value })} />
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

      {/* 2 KHUNG VIỀN TẾT HOÀNG GIA GÓC TRÊN UỐN MỀM MẠI DÁT VÀNG */}
      <div className="tet-corner-ornaments">
        {/* Góc trên bên trái */}
        <svg className="tet-corner-svg corner-left" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldCurvedGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff6c5" />
              <stop offset="25%" stopColor="#ffd700" />
              <stop offset="65%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8f610d" />
            </linearGradient>
            <filter id="goldGlowCurvedLeft">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#d4af37" floodOpacity="0.45"/>
            </filter>
          </defs>
          <g stroke="url(#goldCurvedGradLeft)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#goldGlowCurvedLeft)">
            {/* Đường viền chính uốn cong mềm mại kéo dài */}
            <path d="M 15 190 V 60 Q 15 15 60 15 H 190" />
            <path d="M 30 190 V 70 Q 30 30 70 30 H 190" opacity="0.7" strokeWidth="2.5" />

            {/* Mắt xích mây cuộn hoàng gia mềm mại ở góc */}
            <path d="M 30 70 C 30 45 45 30 70 30 C 95 30 110 45 110 70 C 110 95 90 110 65 105 C 45 100 40 85 45 70 C 50 58 65 52 75 60 C 82 66 80 78 72 82" />
            
            {/* Họa tiết lượn sóng dọc thanh ngang */}
            <path d="M 115 15 Q 130 40 145 15" />
            <path d="M 145 15 C 155 35 170 35 180 15" />

            {/* Họa tiết lượn sóng dọc thanh dọc */}
            <path d="M 15 115 Q 40 130 15 145" />
            <path d="M 15 145 C 35 155 35 170 15 180" />

            {/* Hạt ngọc dát vàng điểm trung tâm */}
            <circle cx="75" cy="72" r="5" fill="url(#goldCurvedGradLeft)" stroke="none" />
          </g>
        </svg>

        {/* Góc trên bên phải */}
        <svg className="tet-corner-svg corner-right" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldCurvedGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff6c5" />
              <stop offset="25%" stopColor="#ffd700" />
              <stop offset="65%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8f610d" />
            </linearGradient>
            <filter id="goldGlowCurvedRight">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#d4af37" floodOpacity="0.45"/>
            </filter>
          </defs>
          <g stroke="url(#goldCurvedGradRight)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#goldGlowCurvedRight)">
            {/* Đường viền chính uốn cong mềm mại kéo dài */}
            <path d="M 185 190 V 60 Q 185 15 140 15 H 10" />
            <path d="M 170 190 V 70 Q 170 30 130 30 H 10" opacity="0.7" strokeWidth="2.5" />

            {/* Mắt xích mây cuộn hoàng gia mềm mại ở góc */}
            <path d="M 170 70 C 170 45 155 30 130 30 C 105 30 90 45 90 70 C 90 95 110 110 135 105 C 155 100 160 85 155 70 C 150 58 135 52 125 60 C 118 66 120 78 128 82" />
            
            {/* Họa tiết lượn sóng dọc thanh ngang */}
            <path d="M 85 15 Q 70 40 55 15" />
            <path d="M 55 15 C 45 35 30 35 20 15" />

            {/* Họa tiết lượn sóng dọc thanh dọc */}
            <path d="M 185 115 Q 160 130 185 145" />
            <path d="M 185 145 C 165 155 165 170 185 180" />

            {/* Hạt ngọc dát vàng điểm trung tâm */}
            <circle cx="125" cy="72" r="5" fill="url(#goldCurvedGradRight)" stroke="none" />
          </g>
        </svg>
      </div>

      <header className="topbar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <BrandLogo size="medium" />
        </Link>

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
            <Link to="/login" className="btn-login" style={{ borderColor: '#d32f2f', color: '#d32f2f' }}>
              Đăng nhập
            </Link>
          )}

          <button className={`cart-header-btn ${isDrawerActive ? 'hidden' : ''}`} onClick={handleOpenCart}>
            <img src={banhTrungImg} alt="Giỏ Hàng Bánh Chưng" className="cart-icon-img" />
          </button>
        </nav>

        {/* Mobile Header Actions */}
        <div className="mobile-header-actions">
          <button className={`cart-header-btn-mobile ${isDrawerActive ? 'hidden' : ''}`} onClick={handleOpenCart}>
            <img src={banhTrungImg} alt="Giỏ Hàng Bánh Chưng" className="cart-icon-img" />
          </button>
          <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>
            <span className="burger-icon">☰</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <FireworksEffect />
        <div className="hero-framed-container">
          <img src={vienTextImg} alt="Khung viền tiêu đề" className="hero-frame-bg-img" />
          <h1>
            <span className="slide-left">Tết Trọn Vị Ngon,</span>
            <span className="slide-right">
              Giao Hàng <span style={{ color: '#d32f2f' }}>Tốc Biến</span>
            </span>
          </h1>
        </div>
        <p className="fade-in hero-subtitle-banner" style={{ textAlign: 'center', marginTop: '-10px', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <img src={sideLeftImg} alt="Side icon" className="hero-side-icon-img" />
          <span>Ưu đãi khai xuân - Giảm 20% cho mọi đơn hàng</span>
          <img src={sideLeftImg} alt="Side icon" className="hero-side-icon-img flipped" />
        </p>
      </section>

      {/* THỰC ĐƠN CHÍNH */}
      <section id="menu" className="reveal-on-scroll">
        <h2 className="section-title">Top món ăn gợi ý dành riêng cho bạn .</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Đang chuẩn bị mâm cỗ...</p>
        ) : (
          <>
            <div className="grid">
              {foods.map(food => (
                <FoodCard key={food.id} food={food} />
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

      {/* GIỚI THIỆU THƯƠNG HIỆU - THE GRAND 5-STAR CULINARY SHOWCASE */}
      <section className="grand-culinary-section reveal-on-scroll">
        <div className="grand-culinary-container">
          {/* Header Crown Subtitle */}
          <div className="grand-header">
            <span className="grand-crest-tag">✦ THE 5-STAR HAUTE CUISINE SUITE ✦</span>
            <h2 className="grand-main-title">
              Nâng Tầm Trải Nghiệm Mâm Cỗ & Món Ngon Mỗi Ngày
            </h2>
            <div className="grand-title-ornament">
              <span className="ornament-line"></span>
              <span className="ornament-star">★ ★ ★ ★ ★</span>
              <span className="ornament-line"></span>
            </div>
          </div>

          {/* Asymmetric Split Showcase */}
          <div className="grand-showcase-grid">
            {/* Left Column: Editorial Manifesto with Gold Vertical Accent */}
            <div className="grand-manifesto-box">
              <div className="manifesto-vertical-accent"></div>
              <div className="manifesto-body">
                <p className="manifesto-lead">
                  Được thành lập với tâm huyết mang hương vị ẩm thực đỉnh cao đến từng gia đình, <strong>TRUNGDUCFOODLY</strong> tiên phong kết hợp giữa tinh hoa chế biến truyền thống và nền tảng công nghệ giao vận Microservices thần tốc.
                </p>
                <p className="manifesto-text">
                  Dù là mâm cỗ Tết sum vầy hay bữa ăn dinh dưỡng hàng ngày, chúng tôi cam kết chất lượng tươi ngon vượt trội, đóng gói giữ nhiệt chuẩn mực và phục vụ tận tâm nhất.
                </p>
                <div className="manifesto-signature-block">
                  <span className="sig-quote">“</span>
                  <p className="sig-text">Trao vị ngon tròn đượm — Gửi trọn vẹn yêu thương tới từng bữa ăn gia đình.</p>
                  <span className="sig-author">— Hội Đồng Nghệ Nhân TRUNGDUCFOODLY —</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Layered Luxury Service Pillars */}
            <div className="grand-pillars-stack">
              <div className="grand-pillar-item">
                <div className="pillar-index">01</div>
                <div className="pillar-info">
                  <h4>Tinh Hoa Ẩm Thực Nghệ Nhân</h4>
                  <p>Nguyên liệu VietGAP tuyển chọn từ sương sớm, chế biến không chất bảo quản.</p>
                </div>
                <div className="pillar-gold-badge">5-STAR QUALITY</div>
              </div>

              <div className="grand-pillar-item">
                <div className="pillar-index">02</div>
                <div className="pillar-info">
                  <h4>Đóng Gói Nhiệt 3 LỚP Thượng Hạng</h4>
                  <p>Công nghệ giữ nhiệt độc quyền bảo lưu độ nóng bốc khói nguyên bản.</p>
                </div>
                <div className="pillar-gold-badge">THERMAL SHIELD</div>
              </div>

              <div className="grand-pillar-item">
                <div className="pillar-index">03</div>
                <div className="pillar-info">
                  <h4>Giao Vận Microservices Tốc Biến</h4>
                  <p>Thuật toán tuyến đường tối ưu đảm bảo bữa ăn trao tận tay chỉ trong 15 phút.</p>
                </div>
                <div className="pillar-gold-badge">EXPRESS 15M</div>
              </div>
            </div>
          </div>

          {/* Bottom Luxury Metric Ribbon Bar */}
          <div className="grand-metric-ribbon">
            <div className="metric-ribbon-item">
              <span className="metric-num">50,000+</span>
              <span className="metric-lbl">Đơn Hàng Hoàn Tảo</span>
            </div>
            <div className="metric-divider">◆</div>
            <div className="metric-ribbon-item">
              <span className="metric-num">30+</span>
              <span className="metric-lbl">Món Đặc Sản Thượng Hạng</span>
            </div>
            <div className="metric-divider">◆</div>
            <div className="metric-ribbon-item">
              <span className="metric-num">15 Phút</span>
              <span className="metric-lbl">Thời Gian Giao Trung Bình</span>
            </div>
            <div className="metric-divider">◆</div>
            <div className="metric-ribbon-item">
              <span className="metric-num">99.8%</span>
              <span className="metric-lbl">Đánh Giá 5 Sao Tuyệt Đối</span>
            </div>
          </div>
        </div>
      </section>



      <div className={`fixed-nav-group ${isDrawerActive || showAddressModal ? 'hidden' : ''}`}>
        <button className="nav-floating-btn cart" onClick={handleOpenCart} style={{ backgroundColor: '#d32f2f' }}>
          <img src={banhTrungImg} alt="Lộc Xuân" className="floating-cart-img" />
          <span className="label">Lộc Xuân</span>
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu-drawer tet-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header tet-drawer-header">
              <Link to="/" onClick={() => setShowMobileMenu(false)} style={{ textDecoration: 'none' }}>
                <BrandLogo size="small" light={true} />
              </Link>
              <button className="btn-close-menu tet-close-btn" onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>

            <div className="mobile-menu-body tet-drawer-body">
              {userName && (
                <div className="mobile-user-card-tet">
                  <div className="user-avatar-tet">🧧</div>
                  <div className="user-text-tet">
                    <div className="user-greeting-tet">Chào xuân, <strong>{userName}</strong> 🌸</div>
                    <div className="user-sub-tet">Chúc Bạn Năm Mới An Khang!</div>
                  </div>
                </div>
              )}

              <nav className="mobile-nav-group-tet">
                <Link to="/home" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet active">
                  <span className="link-icon-tet">🏡</span>
                  <span className="link-text-tet">Trang chủ Đoàn Viên</span>
                  <span className="link-arrow-tet">›</span>
                </Link>

                <Link to="/menu" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                  <span className="link-icon-tet">🧧</span>
                  <span className="link-text-tet">Thực Đơn Tết 2026</span>
                  <span className="link-arrow-tet">›</span>
                </Link>

                {userName && (
                  <>
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                      <span className="link-icon-tet">👤</span>
                      <span className="link-text-tet">Hồ sơ cá nhân</span>
                      <span className="link-arrow-tet">›</span>
                    </Link>

                    <Link to="/orders" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                      <span className="link-icon-tet">🛍️</span>
                      <span className="link-text-tet">Đơn hàng của bạn</span>
                      <span className="link-arrow-tet">›</span>
                    </Link>
                  </>
                )}
              </nav>

              <div className="mobile-menu-divider-tet"></div>

              {userName ? (
                <button
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="btn-mobile-logout-tet"
                >
                  🚪 Thoát tài khoản
                </button>
              ) : (
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="btn-mobile-login-tet">
                  🔑 ĐĂNG NHẬP KHAI XUÂN
                </Link>
              )}

              <div className="mobile-drawer-greeting-box">
                <span>🏮 CHÚC MỪNG NĂM MỚI 🏮</span>
                <p>Vạn Sự Như Ý • Đại Cát Đại Lộc</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAMLINED FULL-WIDTH LUXURY FOOTER */}
      <footer className="homepage-footer-wrapper">
        <div className="footer-main-container">
          <div className="footer-main-grid">
            {/* CỘT 1: THƯƠNG HIỆU */}
            <div className="footer-col footer-brand-col">
              <div className="footer-logo-wrapper" style={{ marginBottom: '12px' }}>
                <BrandLogo size="medium" />
              </div>
              <span className="footer-tagline">⚜️ Ẩm Thực Thượng Hạng — Giao Thần Tốc 15 Phút</span>
              <p className="footer-brand-desc">
                Hệ thống đặt đồ ăn ẩm thực cao cấp chuẩn VietGAP 100%, bảo lưu độ nóng bốc khói nguyên bản và phục vụ chuẩn tiêu chuẩn 5 sao.
              </p>

              <div className="social-badges">
                <a href="#facebook" className="social-badge" title="Facebook"><span>🌐</span></a>
                <a href="#youtube" className="social-badge" title="YouTube"><span>▶️</span></a>
                <a href="#tiktok" className="social-badge" title="TikTok"><span>🎵</span></a>
                <a href="#zalo" className="social-badge" title="Zalo"><span>💬</span></a>
              </div>
            </div>

            {/* CỘT 2: KHÁM PHÁ & HỖ TRỢ */}
            <div className="footer-col">
              <h4>KHÁM PHÁ & HỖ TRỢ</h4>
              <ul className="footer-links-list">
                <li><Link to="/">Trang Chủ Đoàn Viên</Link></li>
                <li><Link to="/menu">Thực Đơn Tết 2026</Link></li>
                <li><Link to="/orders">Theo Dõi Đơn Hàng</Link></li>
                <li><a href="#privacy">Bảo Mật & Điều Khoản</a></li>
              </ul>
            </div>

            {/* CỘT 3: THÔNG TIN LIÊN HỆ */}
            <div className="footer-col footer-contact-col">
              <h4>THÔNG TIN LIÊN HỆ</h4>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>123 Phố Huế, Hai Bà Trưng, Hà Nội | 456 Nguyễn Thị Minh Khai, Q.1, TP.HCM</div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div><strong>Hotline 24/7:</strong> <a href="tel:19008888" className="phone-link">1900 8888</a></div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div><strong>Email:</strong> support@trungducfoodly.vn</div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="footer-bottom-bar">
            <div className="copyright-text">
              © 2026 <strong>TRUNGDUCFOODLY</strong> — Phát triển bởi <strong>Phạm Trung Đức</strong>.
            </div>


          </div>
        </div>
      </footer>
    </div>
  );
}