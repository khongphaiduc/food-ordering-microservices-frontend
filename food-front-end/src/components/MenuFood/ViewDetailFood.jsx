import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart as CartIcon, ArrowLeft, Plus, Minus, Loader2, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

import FoodCard from '../homepage/FoodCard';
import './ViewDetailProduct.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 1. LẤY THÔNG TIN ĐĂNG NHẬP
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const updateCartBadge = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`https://localhost:7150/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      const count = data.cartItems?.filter(it => it.quantity > 0).length || 0;
      setCartCount(count);
    } catch (e) {
      console.error("Lỗi cập nhật badge:", e);
    }
  }, [userId, token]);

  const handleOpenCartDrawer = () => {
    window.dispatchEvent(new Event('openCart'));
  };

  useEffect(() => {
    const handleCartStateChange = (e) => {
      setIsCartOpen(e.detail.isOpen);
    };

    window.addEventListener('cartStateChanged', handleCartStateChange);
    window.addEventListener('cartUpdated', updateCartBadge);

    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết sản phẩm chính
        const productRes = await axios.get(`https://localhost:7150/products/${id}`);
        const productData = productRes.data;
        setProduct(productData);

        if (productData.productVariantDTOs?.length > 0) {
          setSelectedVariant(productData.productVariantDTOs[0]);
        }

        // Lấy danh sách gợi ý
        if (productData.idCategory) {
          try {
            const suggestedRes = await axios.get(`https://localhost:7150/products/recommendation/${productData.idCategory}`);
            const rawList = suggestedRes.data || [];
            if (Array.isArray(rawList)) {
              // Lọc bỏ sản phẩm hiện tại ra khỏi danh sách gợi ý
              const filtered = rawList.filter(item => item.id !== id);
              setSuggestedProducts(filtered.slice(0, 8));
            }
          } catch (e) { 
            console.error("Lỗi lấy gợi ý:", e); 
          }
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (id) {
      fetchData();
      updateCartBadge();
    }

    return () => {
      window.removeEventListener('cartStateChanged', handleCartStateChange);
      window.removeEventListener('cartUpdated', updateCartBadge);
    };
  }, [id, updateCartBadge]);

  const handleAddToCart = async () => {
    if (!userId || !token) {
      alert("Vui lòng đăng nhập để thêm món ăn vào giỏ hàng!");
      navigate('/login');
      return;
    }

    try {
      setIsAdding(true);
      const cartRes = await axios.get(`https://localhost:7150/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const idCart = cartRes.data.idCart;
      let currentItems = cartRes.data.cartItems || [];

      const pId = product.idProduct; 
      const vId = selectedVariant?.idVariant || null;
      const existingIndex = currentItems.findIndex(it => it.idProduct === pId && it.idVariant === vId);

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({ idProduct: pId, idVariant: vId, quantity: quantity });
      }

      const payload = {
        IdCart: idCart,
        CartItems: currentItems.map(it => ({
          ProductId: it.idProduct,
          VariantId: it.idVariant,
          Quantity: it.quantity
        }))
      };

      await axios.post('https://localhost:7150/cart/update-cart', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      window.dispatchEvent(new Event('cartUpdated'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error("Lỗi hệ thống khi thêm giỏ hàng:", error);
      if(error.response?.status === 401) {
          alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
          navigate('/login');
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="modern-loader"><Loader2 className="spinner" size={48} /><p>Đang chuẩn bị món ăn...</p></div>;
  if (!product) return <div className="error-container">Sản phẩm không tồn tại!</div>;

  const totalPrice = (product.price + (selectedVariant?.extraPrice || 0)) * quantity;

  return (
    <div className="modern-detail-wrapper">
      {/* Toast Notification */}
      <div className={`modern-toast ${showToast ? 'show' : ''}`}>
        <div className="toast-content">
          <div className="toast-icon-circle">
            <CheckCircle2 size={20} color="#fff" />
          </div>
          <div className="toast-message">
            <span className="toast-title">Thành công!</span>
            <span className="toast-body">Món ăn đã nằm trong giỏ hàng.</span>
          </div>
          <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
        </div>
        <div className="toast-progress"></div>
      </div>

      {/* Nút giỏ hàng nổi */}
      <div className={`fixed-nav-group ${isCartOpen ? 'hidden' : ''}`}>
        <button className="nav-floating-btn cart" onClick={handleOpenCartDrawer}>
          <span className="icon">🛒</span>
          <span className="label">Giỏ hàng</span>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>

      <div className="container">
        <div className="detail-top-bar">
          <button className="glass-back-btn" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
            <span>Quay lại thực đơn</span>
          </button>
        </div>

        <div className="main-content-card">
          <div className="image-section">
            <div className="badge-overlay">Phổ biến</div>
            <img 
              src={product.productImageDTOs?.[0]?.urlImage || 'https://via.placeholder.com/600'} 
              alt={product.description} 
              className="hero-image" 
            />
          </div>

          <div className="info-section">
            <div className="header-meta">
              <span className="category-tag">Cửa hàng</span>
              <div className="rating">
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <span>4.8 (100+ đánh giá)</span>
              </div>
            </div>

            <h1 className="modern-title">{product.description}</h1>
            
            <div className="price-tag-wrapper">
              <span className="currency">đ</span>
              <span className="amount">{totalPrice.toLocaleString('vi-VN')}</span>
            </div>

            <div className="benefit-icons">
              <div className="icon-item"><Clock size={18}/> 15-25 phút</div>
              <div className="icon-item"><ShieldCheck size={18}/> Đảm bảo chất lượng</div>
            </div>

            <div className="divider" />

            <div className="variant-box">
              <h3>Tùy chọn kích cỡ</h3>
              <div className="modern-variants">
                {product.productVariantDTOs?.map(v => (
                  <label key={v.idVariant} className={`variant-chip ${selectedVariant?.idVariant === v.idVariant ? 'active' : ''}`}>
                    <input 
                       type="radio" 
                       name="size" 
                       onChange={() => setSelectedVariant(v)} 
                       checked={selectedVariant?.idVariant === v.idVariant}
                    />
                    <span className="size-name">{v.name}</span>
                    <span className="plus-price">+{v.extraPrice.toLocaleString('vi-VN')}đ</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="action-bar">
              <div className="modern-counter">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18}/></button>
                <span className="count">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button>
              </div>
              
              <button className="primary-buy-btn" onClick={handleAddToCart} disabled={isAdding}>
                {isAdding ? <Loader2 className="spinner" size={22} /> : <CartIcon size={22} />}
                <span>{isAdding ? 'Đang thêm...' : 'Thêm vào thực đơn'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gợi ý sản phẩm - PHẦN ĐÃ SỬA LỖI DESCRIPTION */}
        <div className="suggestions-section">
          <div className="section-header">
            <h2 className="section-title">Thêm món ngon dành cho bạn</h2>
            <div className="title-underline"></div>
          </div>
          <div className="suggestions-grid">
            {suggestedProducts.map((item) => (
              <FoodCard 
                key={item.id} 
                food={{
                  id: item.id,
                  name: item.name, 
                  price: item.price,
                  // Sử dụng urlImageMain từ payload gợi ý
                  img: item.urlImageMain || 'https://via.placeholder.com/300', 
                  // SỬA TẠI ĐÂY: Dùng "decriptions" theo đúng typo của API
                  desc: item.decriptions || item.description || "Hương vị thơm ngon khó cưỡng" 
                }} 
                onAdd={() => navigate(`/detail/${item.id}`)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;