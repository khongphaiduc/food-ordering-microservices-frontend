import React from 'react';
import { Link } from 'react-router-dom';
import "./foodcard.css";

export default function FoodCard({ food }) {
  return (
    <div className="food-card">
      <div className="food-card-img-container">
        <img src={food.img} alt={food.name} className="food-card-img" />
      </div>
      
      <div className="food-card-body">
        <h3 className="food-card-title">{food.name}</h3>
        <div className="food-card-price">{food.price?.toLocaleString('vi-VN')}đ</div>
        <p className="food-card-desc">{food.desc}</p>
        
        <div className="food-card-actions">
          <Link to={`/detail/${food.id}`} className="btn-outline">
            <span className="btn-text-pc">Xem chi tiết món ăn</span>
            <span className="btn-text-mobile">Xem Chi Tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
}