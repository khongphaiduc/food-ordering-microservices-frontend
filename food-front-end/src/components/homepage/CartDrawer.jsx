import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { 
    ShoppingBag, 
    Sparkles, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight,
    Loader2
} from 'lucide-react';
import banhTrungImg from '../../assets/banhtrung.avif';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import './cartdrawer.css';

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [cartId, setCartId] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";

  const fetchCart = useCallback(async () => {
    if (!userId || !token) return;
    setSyncStatus('loading');
    try {
      const response = await axios.get(`${apiUrl}/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setCartId(data.idCart);
      setItems(data.cartItems || []);
      setSyncStatus('idle');
    } catch (error) {
      setSyncStatus('error');
    }
  }, [userId, token, apiUrl]);

  const updateQuantity = async (productId, variantId, newQuantity) => {
    if (newQuantity < 0) return;

    setSyncStatus('saving');
    try {
      const payload = {
        IdCart: cartId,
        CartItems: items.map(it => ({
          ProductId: it.idProduct,
          VariantId: it.idVariant || null,
          Quantity: (it.idProduct === productId && it.idVariant === variantId) ? newQuantity : it.quantity
        }))
      };

      await axios.post(`${apiUrl}/cart/update-cart`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (newQuantity === 0) {
        setItems(prev => prev.filter(it => !(it.idProduct === productId && it.idVariant === variantId)));
      } else {
        setItems(prev => prev.map(it => 
          (it.idProduct === productId && it.idVariant === variantId) ? { ...it, quantity: newQuantity } : it
        ));
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Update error:", error);
      alert("Không thể cập nhật giỏ hàng!");
      fetchCart();
    } finally {
      setSyncStatus('idle');
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener('cartUpdated', fetchCart);
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => {
      window.removeEventListener('cartUpdated', fetchCart);
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (!userId || items.length === 0) return;
    setIsOpen(false);
    try {
      const response = await axios.get(`${apiUrl}/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/confirm-menu', { state: { cartData: response.data } });
    } catch (err) {
      console.error(err);
    }
  };

  const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

  return (
    <div className="cart-wrapper">
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`cart-drawer tet-cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* HEADER TẾT */}
        <div className="cart-header tet-cart-header">
          <div className="cart-title-group">
            <h2>🧧 Giỏ Hàng Mâm Cỗ Tết</h2>
            <div className="sync-indicator tet-sync-indicator">
              {syncStatus === 'saving' ? (
                <span><Loader2 size={12} className="spin-slow" /> Đang cập nhật mâm cỗ...</span>
              ) : (
                <span>✓ Món ăn sẵn sàng</span>
              )}
            </div>
          </div>
          <button className="btn-close-drawer tet-close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* NỘI DUNG GIỎ HÀNG */}
        <div className="cart-body tet-cart-body">
          {!userId ? (
            <div className="tet-empty-state">
               <div className="empty-decor-wrapper">
                  <img src={banhTrungImg} alt="Bánh Chưng" className="cart-empty-banhtrung-img" />
                  <img src={hoadaotraiImg} alt="Hoa đào" className="empty-peach-accent" />
               </div>
               <h3 className="tet-title">Xuân Sang Rước Lộc! 🌸</h3>
               <p className="tet-desc">Đăng nhập ngay để khám phá mỹ vị ngày Tết và tích lộc đầu năm nhé!</p>
               <a href="/login" className="btn-tet-login">
                  <span>🔑 ĐĂNG NHẬP KHAI XUÂN</span>
               </a>
            </div>
          ) : items.length === 0 ? (
            <div className="tet-empty-state">
               <div className="empty-decor-wrapper">
                  <img src={banhTrungImg} alt="Bánh Chưng" className="cart-empty-banhtrung-img" />
               </div>
               <h3 className="tet-title">Giỏ Hàng Đang Trống 🧧</h3>
               <p className="tet-desc">Mâm cỗ chưa có món ngon. Hãy thêm các mỹ vị Tết vào giỏ nhé!</p>
               <button onClick={() => { setIsOpen(false); navigate('/menu'); }} className="btn-tet-login">
                  <span>🌸 XEM THỰC ĐƠN TẾT</span>
               </button>
            </div>
          ) : (
            items.map(it => (
              <div key={`${it.idProduct}-${it.idVariant}`} className="cart-item tet-cart-item">
                <img src={it.urlImage} alt={it.nameProduct} className="cart-item-img tet-item-img" />
                <div className="cart-item-detail">
                  <div className="cart-item-name">
                    {it.nameProduct} {it.nameVariant && <small className="variant-badge-tet">{it.nameVariant}</small>}
                  </div>
                  <div className="cart-item-price">
                    {it.price?.toLocaleString('vi-VN')}đ
                  </div>

                  <div className="cart-qty-picker-tet">
                    <button 
                      onClick={() => updateQuantity(it.idProduct, it.idVariant, it.quantity - 1)}
                      disabled={syncStatus === 'saving'}
                      className="btn-qty-tet-small"
                    >
                      {it.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                    </button>
                    <span className="qty-val">{it.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(it.idProduct, it.idVariant, it.quantity + 1)}
                      disabled={syncStatus === 'saving'}
                      className="btn-qty-tet-small"
                    ><Plus size={13} /></button>
                  </div>
                </div>

                <div className="cart-item-subtotal-tet">
                  {(it.price * it.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))
          )}
        </div>

        {/* CHÂN GIỎ HÀNG THANH TOÁN */}
        {userId && items.length > 0 && (
          <div className="cart-footer tet-cart-footer">
            <div className="subtotal-info-tet">
               <div className="sub-line">
                  <span>Phí giao hàng Tết:</span>
                  <span className="text-green-tet">FREESHIP 0Đ</span>
               </div>
               <div className="total-row">
                  <span className="total-label-tet">Tạm tính mâm cỗ:</span>
                  <span className="total-amount-tet">{total.toLocaleString('vi-VN')}đ</span>
               </div>
            </div>

            <button 
              className="btn-checkout-tet-drawer" 
              onClick={handleCheckout} 
              disabled={syncStatus === 'saving'}
            >
              <Sparkles size={18} fill="#ffd700" color="#ffd700" />
              <span>THANH TOÁN KHAI XUÂN</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}