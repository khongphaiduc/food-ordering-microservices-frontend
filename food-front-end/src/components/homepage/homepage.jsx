import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard';
import CartDrawer from './CartDrawer';
import { AuthContext } from "../authentications/AuthContext";
import './home.css';

const FOOD_DATA = [
  { id: 1, name: 'Burger Gấu Nướng', desc: 'Thịt bò Angus nướng củi, phô mai tan chảy.', price: 12.5, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', featured: true },
  { id: 2, name: 'Pizza Hải Sản Top', desc: 'Tôm sú, mực tươi và sốt pesto đặc biệt.', price: 18.0, img: 'https://images.unsplash.com/photo-1548365328-9f4f9b9b4f06?w=800', featured: true },
  { id: 3, name: 'Salad Cầu Vồng', desc: 'Rau hữu cơ, hạt quinoa và sốt chanh mật ong.', price: 9.0, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' },
  { id: 4, name: 'Sushi Set Cao Cấp', desc: 'Cá hồi Nauy và lươn nướng Nhật Bản.', price: 25.0, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800' },
  { id: 5, name: 'Mì Ý Sốt Bò Bằm', desc: 'Sợi mì thủ công kết hợp sốt cà chua truyền thống.', price: 14.5, img: 'https://images.unsplash.com/photo-1604908177228-46b6c8f4588f?w=800' },
  { id: 6, name: 'Bánh Phô Mai Nướng', desc: 'Vị ngọt thanh, lớp vỏ bánh giòn rụm.', price: 7.5, img: 'https://images.unsplash.com/photo-1526318472351-c75fcf070e0f?w=800' }
];

export default function Home() {
  const [cart, setCart] = useState({});
  const [isCartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, logoutfood } = useContext(AuthContext);
  const userName = localStorage.getItem("userName");

  const featured = FOOD_DATA.filter(f => f.featured);

  const addToCart = (food) => {
    setCart(prev => {
      const current = prev[food.id] ?? { ...food, qty: 0 };
      return { ...prev, [food.id]: { ...current, qty: current.qty + 1 } };
    });
    setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    setCart(prev => {
      if (qty <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: { ...prev[id], qty } };
    });
  };

  const total = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="page-root">
      <header className="topbar">
        <div className="logo">FOODLY.</div>
        <nav className="nav-links">
          <a href="#intro">Giới thiệu</a>
          <a href="#featured">Món nổi bật</a>
          <a href="#menu">Thực đơn</a>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px' }}>Hi, <strong>{userName}</strong></span>
              <button onClick={logoutfood} style={{ color: '#ff6b6b', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>Thoát</button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">Đăng nhập</Link>
          )}
        </nav>
      </header>

      {/* Section 1: Hero */}
      <section className="hero">
        <h1>Ăn Ngon Mỗi Ngày,<br/>Giao Hàng <span style={{ color: '#ff6b6b' }}>Tốc Biến</span></h1>
        <p>Hệ thống đặt món thông minh giúp bạn tiết kiệm thời gian và tận hưởng bữa ăn trọn vẹ nhất.</p>
        <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '18px', marginTop: '20px' }}>Khám phá ngay</button>
      </section>

      {/* Section 2: Intro/About */}
      <section id="intro" style={{ background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
        <h2 className="section-title">Trải nghiệm dịch vụ 5 sao</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
          <div><h3 style={{ color: '#ff6b6b' }}>🚀 Siêu tốc</h3><p>Nhận món trong vòng 30 phút kể từ khi đặt hàng.</p></div>
          <div><h3 style={{ color: '#ff6b6b' }}>🥗 Tươi ngon</h3><p>Nguyên liệu được nhập mới mỗi ngày từ nông trại.</p></div>
          <div><h3 style={{ color: '#ff6b6b' }}>👨‍🍳 Chuyên nghiệp</h3><p>Chế biến bởi các đầu bếp hàng đầu trong ngành.</p></div>
        </div>
      </section>

      {/* Section 3: Featured Món nổi bật */}
      <section id="featured">
        <h2 className="section-title">🔥 Món ăn nổi bật nhất</h2>
        <div className="featured-grid">
          {featured.map(food => (
            <div key={food.id} className="featured-card">
              <img src={food.img} className="featured-img" alt="" />
              <div className="featured-content">
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ff6b6b', letterSpacing: '2px' }}>BEST SELLER</span>
                <h3 style={{ margin: '10px 0', fontSize: '24px' }}>{food.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>{food.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '22px', fontWeight: '800' }}>${food.price}</span>
                  <button className="btn-primary" onClick={() => addToCart(food)}>Đặt ngay</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Full Menu Grid */}
      <section id="menu">
        <h2 className="section-title">Thực đơn đầy đủ</h2>
        <div className="grid">
          {FOOD_DATA.map(food => (
            <FoodCard key={food.id} food={food} onAdd={() => addToCart(food)} />
          ))}
        </div>
      </section>

      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} items={Object.values(cart)} updateQty={updateQty} total={total} />
      
      <footer style={{ padding: '60px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', opacity: 0.6 }}>
        © 2026 Foodly — Nền tảng giao hàng dành cho tương lai
      </footer>
    </div>
  );
}