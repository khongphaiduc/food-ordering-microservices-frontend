import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard';
import ShoppingCart from './CartDrawer'; 
import './home.css';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerActive, setIsDrawerActive] = useState(false);
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const handleCartState = (e) => setIsDrawerActive(e.detail.isOpen);
    window.addEventListener('cartStateChanged', handleCartState);
    return () => window.removeEventListener('cartStateChanged', handleCartState);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://localhost:7150/products");
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        if (data?.list && Array.isArray(data.list)) {
          setFoods(data.list.map(f => ({
            id: f.id, name: f.name,
            desc: f.decriptions || f.description,
            price: f.price || 0,
            img: f.urlImageMain,
            featured: f.featured
          })));
        }
      } catch (err) { console.error("Lỗi:", err); } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleOpenCart = () => window.dispatchEvent(new Event('openCart'));
  const featured = foods.filter(f => f.featured);

  return (
    <div className="page-root tet-mode">
      <div className="tet-decoration-layer">
        {[...Array(6)].map((_, i) => <span key={i} className="flower">🌸</span>)}
      </div>

      <div className={`fixed-nav-group ${isDrawerActive ? 'hidden' : ''}`}>
        <button className="nav-floating-btn cart" onClick={handleOpenCart} style={{backgroundColor: '#d32f2f'}}>
          <span className="icon">🧧</span>
          <span className="label">Lộc Xuân</span>
        </button>
      </div>

      <header className="topbar">
        <div className="logo" style={{color: '#d32f2f'}}>TRUNGDUCFOODLY<span className="tet-sub">.Tết Đoàn Viên</span></div>
        <nav className="nav-links">
          <a href="/menu">Thực đơn ngày Tết</a>
          <button className={`cart-header-btn ${isDrawerActive ? 'hidden' : ''}`} onClick={handleOpenCart}>
            <span className="cart-icon">🧧</span>
          </button>
          {userName ? (
            <div className="user-info">
              <span>Hi, <strong>{userName}</strong> 🧧</span>
              {/* NÚT MỚI: ĐƠN CỦA BẠN */}
              <Link to="/orders" className="btn-orders-nav">🛍️ Đơn của bạn</Link>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-logout">Thoát</button>
            </div>
          ) : (
            <Link to="/login" className="btn-login" style={{borderColor: '#d32f2f', color: '#d32f2f'}}>Đăng nhập</Link>
          )}
        </nav>
      </header>

      <section className="hero">
        <h1>
          <span className="slide-left">Tết Trọn Vị Ngon,</span>
          <span className="slide-right">
            Giao Hàng <span style={{ color: '#d32f2f' }}>Tốc Biến</span>
          </span>
        </h1>
        <p className="fade-in" style={{textAlign: 'center', marginTop: '-10px', color: '#718096'}}>🧧 Ưu đãi khai xuân - Giảm 20% cho mọi đơn hàng 🧧</p>
      </section>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section id="featured">
          <h2 className="section-title">🔥 Món ăn nổi bật</h2>
          <div className="featured-grid">
            {featured.map(food => (
              <div key={food.id} className="featured-card">
                <img src={food.img} className="featured-img" alt={food.name} />
                <div className="featured-content">
                  <span className="badge-bestseller" style={{background: '#fff5f5', color: '#d32f2f'}}>LỘC XUÂN</span>
                  <h3>{food.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span className="price-tag" style={{color: '#d32f2f'}}>{food.price?.toLocaleString()}đ</span>
                    <button className="btn-primary" onClick={handleOpenCart} style={{background: '#d32f2f'}}>Đặt ngay</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section id="menu">
        <h2 className="section-title">Ngày Tết bạn ăn gì </h2>
        {loading ? ( <p style={{ textAlign: 'center' }}>Đang chuẩn bị mâm cỗ...</p> ) : (
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

      <ShoppingCart />

      <footer style={{ padding: '60px', textAlign: 'center', color: '#d32f2f', background: '#fffaf0', borderTop: '1px solid #fee2e2' }}>
        © 2026 Foodly — Phạm Trung Đức - Chúc Mừng Năm Mới 🧨
      </footer>
    </div>
  );
}