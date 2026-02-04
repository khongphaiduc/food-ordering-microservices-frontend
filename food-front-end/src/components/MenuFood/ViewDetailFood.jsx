import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Loader2, Star, Clock, ShieldCheck } from 'lucide-react';

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

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy chi tiết sản phẩm trước để lấy idCategory
      const productRes = await axios.get(`https://localhost:7150/products/${id}`);
      const productData = productRes.data;
      
      setProduct(productData);

      // Cài đặt variant mặc định
      if (productData.productVariantDTOs?.length > 0) {
        setSelectedVariant(productData.productVariantDTOs[0]);
      }

      // 2. Kiểm tra nếu có idCategory thì mới gọi API gợi ý
      if (productData.idCategory) {
        try {
          const suggestedRes = await axios.get(
            `https://localhost:7150/products/recommendation/${productData.idCategory}`
          );
          
          // Vì payload trả về trực tiếp là một mảng
          const rawList = suggestedRes.data || [];
          
          if (Array.isArray(rawList)) {
            // Lọc bỏ sản phẩm hiện tại khỏi danh sách gợi ý
            const filtered = rawList.filter(item => item.id !== id);
            setSuggestedProducts(filtered.slice(0, 8));
          }
        } catch (suggestError) {
          console.error("Lỗi khi lấy sản phẩm gợi ý:", suggestError);
          setSuggestedProducts([]); // Nếu lỗi gợi ý thì vẫn cho xem sản phẩm chính
        }
      }

    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (id) fetchData();
}, [id]);


  if (loading) return (
    <div className="modern-loader">
      <Loader2 className="spinner" size={48} />
      <p>Đang chuẩn bị món ăn...</p>
    </div>
  );

  if (!product) return <div className="error-container">Sản phẩm không tồn tại!</div>;

  const totalPrice = (product.price + (selectedVariant?.extraPrice || 0)) * quantity;

  return (
    <div className="modern-detail-wrapper">
      <div className="container">
        <button className="glass-back-btn" onClick={() => navigate('/menu')}>
          <ArrowLeft size={20} />
          <span>Quay lại thực đơn</span>
        </button>

        <div className="main-content-card">
          <div className="image-section">
            <div className="badge-overlay">Phổ biến</div>
            <img 
              src={product.productImageDTOs?.[0]?.urlImage || 'https://via.placeholder.com/600'} 
              alt={product.name} 
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

            <h1 className="modern-title">{product.name}</h1>
            
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
              
              <button className="primary-buy-btn">
                <ShoppingCart size={22} />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>
        </div>

        {/* PHẦN SẢN PHẨM GỢI Ý */}
        <div className="suggestions-section">
          <div className="section-header">
            <h2 className="section-title">Thêm món để hương vị thêm ngon dành cho bạn </h2>
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
                  img: item.urlImageMain, 
                  desc: item.decriptions  
                }} 
                onAdd={(f) => console.log("Đã thêm vào giỏ:", f)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;