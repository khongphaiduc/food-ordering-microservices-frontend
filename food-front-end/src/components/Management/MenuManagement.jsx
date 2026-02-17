import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit3, Search, Plus, ChevronLeft, ChevronRight, Loader2, Filter, Eye } from 'lucide-react';
import './MenuManagement.css';

const MenuManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProduct, setTotalProduct] = useState(0);
    const navigate = useNavigate();

    useEffect(() => { fetchProducts(); }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://localhost:7150/products?PageIndex=${currentPage}`);
            setProducts(response.data.list);
            setTotalProduct(response.data.totalProduct);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    return (
        <div className="management-container">
            <header className="page-header">
                <div className="title-section">
                    <h1>Danh mục món ăn <span className="count-badge">{totalProduct}</span></h1>
                </div>
                <div className="header-actions">
                    <button className="primary-btn"><Plus size={20} /> Thêm món mới</button>
                </div>
            </header>

            <div className="toolbar-card">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input type="text" placeholder="Tìm kiếm món ăn..." />
                </div>
                <div className="category-tabs" style={{display: 'flex', gap: '8px'}}>
                    <button className="tab active" style={{padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#4318FF', color: 'white'}}>Tất cả</button>              
                </div>
            </div>

            {loading ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}><Loader2 className="animate-spin" size={40} /></div>
            ) : (
                <div className="product-grid">
                    {products.map((p) => (
                        <div className="product-card" key={p.id}>
                            <div className="card-image-wrapper">
                                <img src={p.imageFoods?.[0]?.urlImage || 'https://via.placeholder.com/300'} alt="" />
                                <div className={`availability-tag ${p.isAvailable ? 'on' : 'off'}`}>
                                    {p.isAvailable ? '● Đang bán' : '● Hết hàng'}
                                </div>
                            </div>
                            <div className="card-content">
                                <h4>{p.name}</h4>
                                <p className="category-label">ID: #{p.id.substring(0,8)}</p>
                                <div className="card-footer">
                                    <span className="price-tag">{p.price?.toLocaleString()}đ</span>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button className="icon-btn" onClick={() => navigate(`/management/product/${p.id}`)}><Edit3 size={16}/></button>                                  
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="pagination-footer">
                <p>Trang {currentPage}</p>
                <div className="pagination-btns">
                    <button className="p-btn" onClick={() => setCurrentPage(c => Math.max(1, c-1))}><ChevronLeft size={20}/></button>
                    <button className="p-btn" onClick={() => setCurrentPage(c => c+1)}><ChevronRight size={20}/></button>
                </div>
            </footer>
        </div>
    );
};

export default MenuManagement;