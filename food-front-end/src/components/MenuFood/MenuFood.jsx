import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodCard from '../homepage/FoodCard';
import './menu.css';

export default function ViewListProductFood() {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [query, setQuery] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const dropdownRef = useRef(null);

    const userId = "9f3c2e7a-4b8d-4a6f-9c21-6f8d2a1b7c54";

    const updateCartBadge = useCallback(async () => {
        try {
            const res = await fetch(`https://localhost:7150/cart/user-cart/${userId}`);
            if (res.ok) {
                const data = await res.json();
                const count = data.cartItems?.filter(it => it.quantity > 0).length || 0;
                setCartCount(count);
            }
        } catch (e) { console.error("Lỗi cập nhật badge:", e); }
    }, [userId]);

    useEffect(() => {
        updateCartBadge();
        window.addEventListener('cartUpdated', updateCartBadge);
        return () => window.removeEventListener('cartUpdated', updateCartBadge);
    }, [updateCartBadge]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = useCallback(async (isMounted) => {
        try {
            setLoading(true);
            const url = query.trim()
                ? `https://localhost:7150/search/products?key=${encodeURIComponent(query)}&Index=${currentPage}`
                : `https://localhost:7150/products?PageIndex=${currentPage}&pageSize=${pageSize}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Lỗi kết nối");
            const data = await res.json();

            if (isMounted) {
                const rawItems = data.list || data.items || data || [];
                const total = data.totalProduct || data.totalCount || 0;
                setFoods(rawItems.map(f => ({
                    id: f.idProduct || f.id,
                    name: f.description || f.name || "Món ăn",
                    desc: f.decriptions || f.description || "",
                    price: f.price || 0,
                    img: f.urlImageMain || (f.productImageDTOs?.[0]?.urlImage) || "https://via.placeholder.com/150",
                })));
                setTotalItems(total);
            }
        } catch (err) {
            if (isMounted) setFoods([]);
        } finally {
            if (isMounted) setLoading(false);
        }
    }, [currentPage, pageSize, query]);

    useEffect(() => {
        let isMounted = true;
        fetchData(isMounted);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return () => { isMounted = false; };
    }, [fetchData]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(`https://localhost:7150/search/suggest?Name=${encodeURIComponent(searchTerm)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) { console.error(err); }
        }, 200);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSearch = () => {
        setCurrentPage(1);
        setQuery(searchTerm);
        setShowSuggestions(false);
    };

    const handleReset = () => {
        setSearchTerm("");
        setQuery("");
        setCurrentPage(1);
        setSuggestions([]);
    };

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 4;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button 
                    key={i} 
                    className={`page-number ${currentPage === i ? 'active' : ''}`} 
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="menu-page-container">
            {/* Trang trí */}
            <div className="tet-decoration left-branch"></div>
            <div className="tet-decoration right-branch"></div>

            {/* NHÓM NÚT ĐIỀU HƯỚNG NỔI (FIXED) */}
            <div className="fixed-nav-group">
                <button className="nav-floating-btn cart" onClick={() => window.dispatchEvent(new Event('openCart'))}>
                    <span className="icon">🧧</span>
                    <span className="label">Lộc Xuân</span>
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </button>
                <button className="nav-floating-btn home" onClick={() => navigate('/')}>
                    <span className="icon">🏠</span>
                    <span className="label">Trang Chủ</span>
                </button>
            </div>

            <header className="menu-header">
                <div className="header-left">
                    <h1 className="page-title">🏮 Mỹ Vị Khai Xuân 🏮</h1>
                    <p className="results-subtitle">Tìm thấy <b>{totalItems}</b> món ngon đãi tiệc</p>
                </div>

                <div className="search-controls" ref={dropdownRef}>
                    <div className="search-box-wrapper">
                        <input
                            type="text"
                            className="search-input-modern"
                            placeholder="Bạn muốn ăn gì ngày Tết?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="suggestion-dropdown">
                                {suggestions.map((item, index) => (
                                    <li key={index} onClick={() => { setSearchTerm(item); setQuery(item); setCurrentPage(1); setShowSuggestions(false); }}>
                                        <span className="s-icon">🌸</span>
                                        <span className="s-text">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="btn-action search" onClick={handleSearch}>Khai Lộc</button>
                    <button className="btn-action reset" onClick={handleReset}>Reset</button>
                </div>
            </header>

            <hr className="header-divider" />

            {loading ? (
                <div className="loading-state">🎋 Đang chuẩn bị mâm cỗ...</div>
            ) : (
                <>
                    <div className="food-grid">
                        {foods.length > 0 ? (
                            foods.map(food => <FoodCard key={food.id} food={food} />)
                        ) : (
                            <div className="no-results">Không tìm thấy món ngon nào khớp với "{query}"</div>
                        )}
                    </div>

                    <div className="pagination-modern">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-nav">&laquo;</button>
                        <div className="p-numbers-group">
                            {renderPageNumbers()}
                        </div>
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-nav">&raquo;</button>
                    </div>
                </>
            )}
        </div>
    );
}