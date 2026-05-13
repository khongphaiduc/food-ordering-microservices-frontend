import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit3, Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import './MenuManagement.css';

const MenuManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProduct, setTotalProduct] = useState(0);
    const navigate = useNavigate();
 const apiUrl = import.meta.env.VITE_API_URL;
    useEffect(() => { 
        fetchProducts(); 
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/products?PageIndex=${currentPage}`);
            setProducts(response.data.list);
            setTotalProduct(response.data.totalProduct);
        } catch (error) { 
            console.error("Lỗi khi lấy dữ liệu:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    const getProductImage = (imageFoods) => {
        if (!imageFoods || imageFoods.length === 0) return 'https://via.placeholder.com/300';
        const mainImage = imageFoods.find(img => img.isMain);
        return mainImage ? mainImage.urlImage : imageFoods[0].urlImage;
    };

    return (
        <div className="management-container">
            {/* Thanh công cụ: Tìm kiếm và Thêm mới */}
            <div className="toolbar-card">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input type="text" placeholder="Tìm kiếm món ăn..." />
                </div>
                
                <button 
                    className="primary-btn" 
                    onClick={() => navigate('/management/product/add')}
                >
                    <Plus size={20} /> Thêm Mới Sản Phẩm
                </button>
            </div>

            {loading ? (
                <div className="loader-container">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((p) => (
                        <div className="product-card" key={p.id}>
                            <div className="card-image-wrapper">
                                <img src={getProductImage(p.imageFoods)} alt={p.name} />
                                <div className={`availability-tag ${p.isAvailable ? 'on' : 'off'}`}>
                                    {p.isAvailable ? '● Đang bán' : '● Hết hàng'}
                                </div>
                            </div>
                            <div className="card-content">
                                <h4 title={p.name}>{p.name}</h4>
                                <p className="description-label">{p.decriptions}</p>
                                <p className="category-label">#{p.id.substring(0,8)}</p>
                                <div className="card-footer">
                                    <span className="price-tag">{p.price?.toLocaleString()}đ</span>
                                    <button 
                                        className="icon-btn" 
                                        onClick={() => navigate(`/management/product/${p.id}`)}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit3 size={14}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="pagination-footer">
                <p>Tổng cộng: <b>{totalProduct}</b> sản phẩm | Trang {currentPage}</p>
                <div className="pagination-btns">
                    <button 
                        className="p-btn" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c-1))}
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    <button 
                        className="p-btn" 
                        onClick={() => setCurrentPage(c => c+1)}
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MenuManagement;