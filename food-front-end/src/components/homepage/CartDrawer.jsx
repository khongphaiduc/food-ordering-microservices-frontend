import React from 'react';

export default function CartDrawer({ open, onClose, items, updateQty, total }) {
  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`cart-drawer ${open ? 'open' : ''}`}>
        <div style={{ padding: '30px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Giỏ hàng</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>
        
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>Giỏ hàng đang trống 🍕</div>
          ) : (
            items.map(it => (
              <div key={it.id} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', background: 'var(--glass)', padding: '15px', borderRadius: '16px' }}>
                <img src={it.img} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{it.name}</div>
                  <div style={{ fontSize: '14px', color: '#ff6b6b' }}>${(it.price * it.qty).toFixed(2)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <button onClick={() => updateQty(it.id, it.qty - 1)} style={{ width: '25px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '5px' }}>-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => updateQty(it.id, it.qty + 1)} style={{ width: '25px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '5px' }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '30px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: '800' }}>
            <span>Tổng cộng:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: '16px' }}>Thanh toán ngay</button>
        </div>
      </aside>
    </>
  );
}