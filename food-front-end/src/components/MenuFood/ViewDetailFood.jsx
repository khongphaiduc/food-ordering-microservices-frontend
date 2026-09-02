import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart as CartIcon, ArrowLeft, Plus, Minus, Loader2,
  Star, Clock, ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Award
} from 'lucide-react';

import FoodCard from '../homepage/FoodCard';
import banhTrungImg from '../../assets/banhtrung.avif';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import longdentetImg from '../../assets/longdentet.png';
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

  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";

  // --- LOGIC CHUYỂN ẢNH TỰ ĐỘNG CHO SẢN PHẨM CHÍNH ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product?.productImageDTOs?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.productImageDTOs.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [product]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.productImageDTOs.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.productImageDTOs.length) % product.productImageDTOs.length);
  };

  // --- GIỎ HÀNG & BADGE ---
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const updateCartBadge = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${apiUrl}/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.data.cartItems?.filter(it => it.quantity > 0).length || 0;
      setCartCount(count);
    } catch (e) {
      console.error("Lỗi cập nhật badge:", e);
    }
  }, [userId, token, apiUrl]);

  const handleOpenCartDrawer = () => {
    window.dispatchEvent(new Event('openCart'));
  };

  // --- LOGIC TRACKING DÙNG CHUNG ---
  const trackUserAction = async (eventType, productId) => {
    const sessionId = localStorage.getItem("sessionId");
    const currentUserId = localStorage.getItem("userId");

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    const seconds = today.getSeconds().toString().padStart(2, '0');

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    const newEvent = {
      EventType: eventType,
      IdProduct: productId,
      CreateAt: formattedDate
    };

    let trackingQueue = JSON.parse(localStorage.getItem('trackingQueue') || '[]');
    trackingQueue.push(newEvent);
    localStorage.setItem('trackingQueue', JSON.stringify(trackingQueue));

    if (trackingQueue.length >= 5) {
      const payload = {
        IdSession: sessionId || "",
        IdUser: currentUserId || null,
        PayLoad: trackingQueue
      };

      try {
        await axios.post(`${apiUrl}/tracking`, payload);
        localStorage.removeItem('trackingQueue');
      } catch (error) {
        console.error("Lỗi gửi tracking data:", error);
      }
    }
  };

  // --- FETCH DATA (CHÍNH & GỢI Ý) ---
  useEffect(() => {
    const handleCartStateChange = (e) => setIsCartOpen(e.detail.isOpen);
    window.addEventListener('cartStateChanged', handleCartStateChange);
    window.addEventListener('cartUpdated', updateCartBadge);

    const fetchData = async () => {
      try {
        setLoading(true);

        const productRes = await axios.get(`${apiUrl}/products/${id}`);
        const productData = productRes.data;
        setProduct(productData);
        setCurrentImageIndex(0);

        if (productData.productVariantDTOs?.length > 0) {
          setSelectedVariant(productData.productVariantDTOs[0]);
        }

        const productIdToTrack = productData.idProduct || id;
        trackUserAction(1, productIdToTrack);

        if (productData.idCategory) {
          try {
            const suggestedRes = await axios.get(`${apiUrl}/products/recommendation/${productData.idCategory}`);
            const rawList = suggestedRes.data || [];

            if (Array.isArray(rawList)) {
              const mappedSuggestions = rawList
                .filter(item => item.id !== id)
                .map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  img: item.imageFoods?.find(img => img.isMain)?.urlImage
                    || item.imageFoods?.[0]?.urlImage
                    || 'https://via.placeholder.com/300',
                  quantity: item.quality ?? item.quantity ?? item.stock ?? 0,
                  desc: item.decriptions || "Món ngon đãi tiệc Tết"
                }));
              setSuggestedProducts(mappedSuggestions.slice(0, 6));
            }
          } catch (e) { console.error("Lỗi lấy gợi ý:", e); }
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
  }, [id, updateCartBadge, apiUrl]);

  // --- THÊM VÀO GIỎ HÀNG ---
  const handleAddToCart = async () => {

    if (!userId || !token) {
      alert("Vui lòng đăng nhập để thêm món vào giỏ hàng nhé!");
      navigate('/login');
      return;
    }

    const availableStock = product?.quality ?? product?.quantity ?? product?.stock ?? 0;

    // 1. Kiểm tra nếu sản phẩm đã hết hàng
    if (availableStock <= 0) {
      alert("Rất tiếc, món ăn này hiện đã HẾT HÀNG trong ngày!");
      return;
    }

    // 2. Kiểm tra số lượng người dùng chọn mua có vượt quá tồn kho không
    if (quantity > availableStock) {
      alert(`Rất tiếc! Số lượng bạn chọn (${quantity} suất) vượt quá số lượng còn lại trong ngày (${availableStock} suất).`);
      return;
    }

    try {
      setIsAdding(true);
      const cartRes = await axios.get(`${apiUrl}/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const idCart = cartRes.data.idCart;
      let currentItems = cartRes.data.cartItems || [];
      const vId = selectedVariant?.idVariant || null;
      const existingIndex = currentItems.findIndex(it => it.idProduct === (product.idProduct || id) && it.idVariant === vId);

      const currentQtyInCart = existingIndex > -1 ? currentItems[existingIndex].quantity : 0;
      const newTotalQty = currentQtyInCart + quantity;

      // 3. Kiểm tra tổng số lượng trong giỏ hàng + số lượng thêm mới
      if (newTotalQty > availableStock) {
        alert(`Không thể thêm! Giỏ hàng của bạn đã có ${currentQtyInCart} suất. Tổng số lượng (${newTotalQty} suất) sẽ vượt quá số lượng xuất còn lại trong ngày (${availableStock} suất).`);
        return;
      }

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity = newTotalQty;
      } else {
        currentItems.push({ idProduct: product.idProduct || id, idVariant: vId, quantity: quantity });
      }

      const payload = {
        IdCart: idCart,
        CartItems: currentItems.map(it => ({
          ProductId: it.idProduct,
          VariantId: it.idVariant,
          Quantity: it.quantity
        }))
      };

      await axios.post(`${apiUrl}/cart/update-cart`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      trackUserAction(3, product.idProduct || id);

      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('openCart'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);

    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      if (error.response?.status === 401) navigate('/login');
      else alert("Không thể thêm món vào giỏ hàng!");
    } finally { setIsAdding(false); }
  };

  if (loading) return <div className="modern-loader tet-loader"><Loader2 className="spinner" size={48} /><p>Đang chuẩn bị mâm cỗ Tết...</p></div>;
  if (!product) return <div className="error-container tet-error">Món ăn không tồn tại!</div>;

  const totalPrice = (product.price + (selectedVariant?.extraPrice || 0)) * quantity;
  const productQuantity = product.quality ?? product.quantity ?? product.stock ?? 0;

  return (
    <div className="modern-detail-wrapper tet-detail-mode">
      {/* TRANG TRÍ HOẠ TIẾT TẾT CHÌM */}
      <img src={longdentetImg} alt="Lồng đèn Tết" className="detail-lantern-decor" />
      <img src={hoadaotraiImg} alt="Cành đào" className="detail-peach-decor" />

      {/* TOAST THÔNG BÁO */}
      <div className={`simple-mini-toast tet-mini-toast ${showToast ? 'show' : ''}`}>
        <span>🧧 Đã thêm vào mâm cỗ Tết!</span>
      </div>

      {/* FLOATING NAVIGATION GROUP (QUAY VỀ THỰC ĐƠN + GIỎ MÓN) */}
      <div className={`fixed-nav-group ${isCartOpen ? 'hidden' : ''}`}>
        <button className="nav-floating-btn menu-btn tet-float-menu" onClick={() => navigate('/menu')}>
          <ArrowLeft size={18} />
          <span className="label">Thực đơn</span>
        </button>
        <button className="nav-floating-btn cart tet-float-cart" onClick={handleOpenCartDrawer}>
          <img src={banhTrungImg} alt="Giỏ món" className="floating-cart-img" />
          <span className="label">Giỏ món</span>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>

      <div className="container">
        {/* MAIN CARD DETAIL */}
        <div className="main-content-card tet-main-card">
          {/* SLIDESHOW SECTION */}
          <div className="image-section tet-image-section">
            <div className="badge-overlay tet-badge-overlay">
              <Sparkles size={14} /> ✦ ĐẶC SẢN TẾT ✦
            </div>

            <div className="slideshow-container tet-slideshow">
              {product.productImageDTOs?.map((img, index) => (
                <img
                  key={index}
                  src={img.urlImage}
                  alt="food"
                  className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}

              {product.productImageDTOs?.length > 1 && (
                <>
                  <button className="slide-nav-btn prev tet-slide-btn" onClick={prevImage}><ChevronLeft size={20} /></button>
                  <button className="slide-nav-btn next tet-slide-btn" onClick={nextImage}><ChevronRight size={20} /></button>
                  <div className="slide-indicators">
                    {product.productImageDTOs.map((_, idx) => (
                      <div key={idx} className={`dot ${idx === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(idx)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="info-section tet-info-section">
            <div className="header-meta">
              <span className="category-tag tet-category-tag">🏮 Khai Xuân Mỹ Vị</span>
              <div className="rating tet-rating">
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <span>4.9 (150+ đánh giá)</span>
              </div>
            </div>

            <h1 className="modern-title tet-product-title">{product.name}</h1>

            <div className="price-tag-wrapper tet-price-wrapper">
              <span className="amount tet-amount">{totalPrice.toLocaleString('vi-VN')}</span>
              <span className="currency tet-currency">đ</span>
              <span className="freeship-tag-tet">Freeship Khai Xuân 0đ</span>
            </div>

            <p className="modern-description tet-desc">{product.description}</p>

            <div className="benefit-icons tet-benefits">
              <div className="icon-item"><Clock size={16} /> 15-25 phút giao thần tốc</div>
              <div className="icon-item"><ShieldCheck size={16} /> Chuẩn ATVSTP</div>
              <div className="icon-item"><Award size={16} /> Vị Ngon 5 Sao</div>
            </div>

            <div className="divider tet-divider" />

            {/* THÔNG TIN SỐ LƯỢNG SUẤT CÒN LẠI */}
            <div className="stock-info-variant-wrapper">
              {productQuantity > 0 ? (
                <span className="stock-tag-tet">
                  🔥 Số lượng còn lại: <strong>{productQuantity}</strong> suất hôm nay
                </span>
              ) : (
                <span className="stock-tag-tet out-of-stock">
                  ❌ Đã hết hàng trong ngày
                </span>
              )}
            </div>

            {/* SELECTION VARIANTS */}
            {product.productVariantDTOs?.length > 0 && (
              <div className="variant-box tet-variant-box">
                <h3>Chọn kích cỡ / Khẩu phần:</h3>
                <div className="modern-variants tet-variants-list">
                  {product.productVariantDTOs.map(v => (
                    <label key={v.idVariant} className={`variant-chip tet-chip ${selectedVariant?.idVariant === v.idVariant ? 'active' : ''}`}>
                      <input type="radio" name="size" onChange={() => setSelectedVariant(v)} checked={selectedVariant?.idVariant === v.idVariant} />
                      <span className="size-name">{v.name}</span>
                      <span className="plus-price">+{v.extraPrice.toLocaleString('vi-VN')}đ</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BAR */}
            <div className="action-bar tet-action-bar">
              <div className="modern-counter tet-counter">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="counter-btn" disabled={productQuantity <= 0}><Minus size={16} /></button>
                <span className="count">{productQuantity <= 0 ? 0 : quantity}</span>
                <button onClick={() => setQuantity(Math.min(productQuantity, quantity + 1))} className="counter-btn" disabled={productQuantity <= 0 || quantity >= productQuantity}><Plus size={16} /></button>
              </div>

              <button 
                className="primary-buy-btn tet-buy-btn" 
                onClick={handleAddToCart} 
                disabled={isAdding || productQuantity <= 0}
              >
                {isAdding ? <Loader2 className="spinner" size={20} /> : <CartIcon size={20} />}
                <span>
                  {isAdding 
                    ? 'Đang thêm...' 
                    : productQuantity <= 0 
                      ? 'HẾT HÀNG HÔM NAY' 
                      : 'THÊM VÀO GIỎ HÀNG'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SUGGESTIONS SECTION */}

        {suggestedProducts.length > 0 && (
          <div className="suggestions-section tet-suggestions">
            <div className="section-header tet-section-header">
              <h2 className="section-title tet-sec-title">🌸 Gợi Ý Món Ngon Đi Kèm Mâm Cỗ 🌸</h2>
              <div className="title-underline tet-underline"></div>
            </div>

            <div className="food-grid tet-suggestions-grid">
              {suggestedProducts.map((item) => (
                <FoodCard
                  key={item.id}
                  food={item}
                  onAdd={() => navigate(`/detail/${item.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;