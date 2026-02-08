import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './cartdrawer.css';

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  
  // 1. Lấy dữ liệu từ localStorage (Đã lưu lúc đăng nhập)
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const cartIdRef = useRef(null);
  const isInitialMount = useRef(true);
  const lastSyncedItemsRef = useRef([]);

  // Phát tín hiệu trạng thái Drawer cho các component khác
  useEffect(() => {
    const event = new CustomEvent('cartStateChanged', { detail: { isOpen } });
    window.dispatchEvent(event);
  }, [isOpen]);

  // 2. Hàm lấy dữ liệu giỏ hàng với Token
  const fetchCart = useCallback(async () => {
    // Nếu chưa đăng nhập thì không gọi API
    if (!userId || !token) return;

    setSyncStatus('loading');
    try {
      const response = await axios.get(`https://localhost:7150/cart/user-cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Gửi token nếu API yêu cầu
        }
      });
      
      const data = response.data;
      cartIdRef.current = data.idCart;
      
      const normalizedItems = (data.cartItems || []).map(it => ({
        idProduct: it.idProduct,
        idVariant: it.idVariant || null,
        quantity: it.quantity,
        price: it.price,
        nameProduct: it.nameProduct,
        nameVariant: it.nameVariant,
        urlImage: it.urlImage
      }));

      setItems(normalizedItems);
      lastSyncedItemsRef.current = JSON.parse(JSON.stringify(normalizedItems)); 
      setSyncStatus('idle');
    } catch (error) {
      console.error("Fetch error:", error);
      setSyncStatus('error');
    }
  }, [userId, token]);

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

  const updateQty = (idProduct, idVariant, newQty) => {
    setItems(prev => prev.map(item => 
      (item.idProduct === idProduct && item.idVariant === idVariant) 
        ? { ...item, quantity: Math.max(0, newQty) } 
        : item
    ));
  };

  const hasChanges = (current, last) => {
    if (current.length !== last.length) return true;
    return current.some((item, index) => {
      const prev = last[index];
      return (
        item.idProduct !== prev?.idProduct ||
        item.idVariant !== prev?.idVariant ||
        item.quantity !== prev?.quantity
      );
    });
  };

  // 3. Đồng bộ hóa giỏ hàng lên Server (Debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!hasChanges(items, lastSyncedItemsRef.current)) return;
    if (!token) return; // Bảo vệ nếu mất token đột ngột

    const handler = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const payload = {
          IdCart: cartIdRef.current,
          CartItems: items.map(it => ({
            ProductId: it.idProduct,
            VariantId: it.idVariant || null,
            Quantity: it.quantity
          }))
        };
        
        await axios.post('https://localhost:7150/cart/update-cart', payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const cleanItems = items.filter(it => it.quantity > 0);
        setItems(cleanItems);
        lastSyncedItemsRef.current = JSON.parse(JSON.stringify(cleanItems));
        
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        console.error("Update error:", error);
        setSyncStatus('error');
      }
    }, 800); 

    return () => clearTimeout(handler);
  }, [items, token]);

  const activeItems = items.filter(it => it.quantity > 0);
  const total = activeItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);

  // Nếu chưa đăng nhập, có thể hiển thị thông báo thay vì giỏ hàng trống
  if (!userId) {
    return (
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
         <div className="cart-header">
            <h2>Giỏ hàng</h2>
            <button className="btn-close-drawer" onClick={() => setIsOpen(false)}>✕</button>
         </div>
         <div className="cart-body cart-empty-state">
            <p>Vui lòng đăng nhập để xem giỏ hàng</p>
            <a href="/login" className="btn-checkout" style={{textDecoration: 'none', textAlign:'center'}}>ĐĂNG NHẬP NGAY</a>
         </div>
      </aside>
    );
  }

  return (
    <div className="cart-wrapper">
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title-group">
            <h2>Menu của bạn</h2>
            <div className="sync-indicator">
              {syncStatus === 'loading' && <span className="status-loading">🔄...</span>}
              {syncStatus === 'saving' && <span className="status-saving">⏳ Lưu...</span>}
              {syncStatus === 'synced' && <span className="status-synced">✓ Xong</span>}
              {syncStatus === 'error' && <span className="status-error">❌ Lỗi</span>}
            </div>
          </div>
          <button className="btn-close-drawer" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cart-body">
          {activeItems.length === 0 && syncStatus !== 'loading' ? (
            <div className="cart-empty-state">
              <p>Bạn chưa thêm món ăn nào</p>
            </div>
          ) : (
            activeItems.map(it => (
              <div key={`${it.idProduct}-${it.idVariant}`} className="cart-item">
                <img src={it.urlImage} alt={it.nameProduct} className="cart-item-img" />
                <div className="cart-item-detail">
                  <div className="cart-item-name">{it.nameProduct} {it.nameVariant && `(${it.nameVariant})`}</div>
                  <div className="cart-item-price">{it.price?.toLocaleString('vi-VN')}đ</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(it.idProduct, it.idVariant, it.quantity - 1)}>
                      {it.quantity === 1 ? '🗑️' : '-'}
                    </button>
                    <span className="qty-value">{it.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(it.idProduct, it.idVariant, it.quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Tổng cộng:</span>
            <span className="total-amount">{total.toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-checkout" disabled={activeItems.length === 0 || syncStatus === 'saving'}>
            THANH TOÁN NGAY
          </button>
        </div>
      </aside>
    </div>
  );
}