import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard';
import CartDrawer from './CartDrawer';
import { AuthContext } from "../authentications/AuthContext";
import './home.css';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isCartOpen, setCartOpen] = useState(false);

  const { isAuthenticated, logoutfood } = useContext(AuthContext);
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://localhost:7150/products");
        const data = await response.json();
        
        // Kiểm tra đúng cấu trúc { list: [...] }
        if (data && Array.isArray(data.list)) {
          const mapped = data.list.map(f => ({
            id: f.id,
            name: f.name,
            desc: f.decriptions || f.description, // Đề phòng sai chính tả từ backend
            price: f.price,
            img: f.urlImageMain,
            featured: f.featured
          }));
          setFoods(mapped);
        }
      } catch (err) {
        console.error("Không thể tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featured = foods.filter(f => f.featured);

  const addToCart = (food) => {
    setCart(prev => {
      const current = prev[food.id] ?? { ...food, qty: 0 };
      return { ...prev, [food.id]: { ...current, qty: current.qty + 1 } };
    });
    setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    setCart(prev => {
      if (qty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
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
          <a href="#menu">Thực đơn</a>
          {isAuthenticated ? (
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px' }}>Hi, <strong>{userName}</strong></span>
              <button onClick={logoutfood} className="btn-logout">Thoát</button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">Đăng nhập</Link>
          )}
        </nav>
      </header>

      <section className="hero">
        <h1>Ăn Ngon Mỗi Ngày,<br />Giao Hàng <span style={{ color: '#ff6b6b' }}>Tốc Biến</span></h1>
        <p>Hệ thống đặt món thông minh giúp bạn tiết kiệm thời gian.</p>
      </section>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section id="featured">
          <h2 className="section-title">🔥 Món ăn nổi bật nhất</h2>
          <div className="featured-grid">
            {featured.map(food => (
              <div key={food.id} className="featured-card">
                <img src={food.img} className="featured-img" alt={food.name} />
                <div className="featured-content">
                  <span className="badge-bestseller">BEST SELLER</span>
                  <h3>{food.name}</h3>
                  <p>{food.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="price-tag">${food.price}</span>
                    <button className="btn-primary" onClick={() => addToCart(food)}>Đặt ngay</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Menu */}
      <section id="menu">
        <h2 className="section-title">Thực đơn của chúng tôi</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p>
        ) : (
          <div className="grid">
            {foods.length > 0 ? (
              foods.map(food => (
                <FoodCard key={food.id} food={food} onAdd={() => addToCart(food)} />
              ))
            ) : (
              <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Không tìm thấy sản phẩm nào.</p>
            )}
          </div>
        )}

        <div className="show-more-container" style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/menu" className="btn-show-more-link">
            Xem thêm tất cả món ăn
          </Link>
        </div>
      </section>

      <CartDrawer
        open={isCartOpen}
        onClose={() => setCartOpen(false)}
        items={Object.values(cart)}
        updateQty={updateQty}
        total={total}
      />

      <footer style={{ padding: '60px', textAlign: 'center', opacity: 0.6 }}>
        © 2026 Foodly — Nền tảng giao hàng dành cho tương lai
      </footer>
    </div>
  );
}