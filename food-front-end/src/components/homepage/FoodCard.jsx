import React from 'react';

export default function FoodCard({ food, onAdd }) {
  return (
    <div className="food-card" style={{ background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--glass-border)', overflow: 'hidden', transition: '0.3s' }}>
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <img src={food.img} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>{food.name}</h3>
          <span style={{ fontWeight: '800', color: '#ff6b6b' }}>${food.price}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>{food.desc}</p>
        <button className="btn-primary" style={{ width: '100%' }} onClick={onAdd}>Thêm vào giỏ</button>
      </div>
    </div>
  );
}