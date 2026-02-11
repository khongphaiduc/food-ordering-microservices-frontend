import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './cartdrawer.css';

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [cartId, setCartId] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const fetchCart = useCallback(async () => {
    if (!userId || !token) return;
    setSyncStatus('loading');
    try {
      const response = await axios.get(`https://localhost:7150/cart/user-cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setCartId(data.idCart);
      setItems(data.cartItems || []);
      setSyncStatus('idle');
    } catch (error) {
      setSyncStatus('error');
    }
  }, [userId, token]);

  const updateQuantity = async (productId, variantId, newQuantity) => {
    if (newQuantity < 0) return; // Không cho phép số lượng âm

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

      await axios.post(`https://localhost:7150/cart/update-cart`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Nếu newQuantity = 0, xóa khỏi state. Nếu không, cập nhật số mới
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
      alert("Không thể cập nhật giỏ hàng");
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
    const response = await axios.get(`https://localhost:7150/cart/user-cart/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    navigate('/confirm-menu', { state: { cartData: response.data } });
  };

  const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

  return (
    <div className="cart-wrapper">
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title-group">
            <h2>Giỏ hàng của bạn</h2>
            <div className="sync-indicator">
              {syncStatus === 'saving' ? '⏳ Đang cập nhật...' : '✓ Hệ thống sẵn sàng'}
            </div>
          </div>
          <button className="btn-close-drawer" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cart-body">
          {!userId ? (
            <div className="tet-empty-state">
               <span className="tet-icon">🧧</span>
               <h3 className="tet-title">Xuân sang, rước lộc!</h3>
               <p className="tet-desc">Vui lòng đăng nhập để đặt món nhé.</p>
               <a href="/login" className="btn-tet-login">ĐĂNG NHẬP</a>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty-state"><p>Giỏ hàng đang trống</p></div>
          ) : (
            items.map(it => (
              <div key={`${it.idProduct}-${it.idVariant}`} className="cart-item">
                <img src={it.urlImage} alt={it.nameProduct} className="cart-item-img" />
                <div className="cart-item-detail">
                  <div className="cart-item-name">{it.nameProduct} <small>{it.nameVariant}</small></div>
                  <div className="cart-item-price">{it.price?.toLocaleString('vi-VN')}đ</div>
                  <div className="cart-qty-picker">
                    <button 
                      onClick={() => updateQuantity(it.idProduct, it.idVariant, it.quantity - 1)}
                      disabled={syncStatus === 'saving'}
                      className="btn-qty"
                    >
                      {it.quantity === 1 ? '🗑️' : '−'}
                    </button>
                    <span>{it.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(it.idProduct, it.idVariant, it.quantity + 1)}
                      disabled={syncStatus === 'saving'}
                      className="btn-qty"
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {userId && items.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Tạm tính:</span>
              <span className="total-amount">{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <button className="btn-checkout" onClick={handleCheckout} disabled={syncStatus === 'saving'}>
              THANH TOÁN NGAY
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}