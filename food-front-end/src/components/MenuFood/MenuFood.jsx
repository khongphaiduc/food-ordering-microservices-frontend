import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Flame,
    Home
} from 'lucide-react';
import FoodCard from '../homepage/FoodCard';
import Swal from 'sweetalert2';
import BrandLogo from '../homepage/BrandLogo';
import banhTrungImg from '../../assets/banhtrung.avif';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import longdentetImg from '../../assets/longdentet.png';
import './menu.css';

export default function ViewListProductFood() {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    const [searchTerm, setSearchTerm] = useState("");
    const [query, setQuery] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId") || "9f3c2e7a-4b8d-4a6f-9c21-6f8d2a1b7c54";

    const handleLogout = async () => {
        setShowMobileMenu(false);
        setShowUserMenu(false);
        const result = await Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: 'Bạn có chắc chắn muốn đăng xuất không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // 1. CẬP NHẬT BADGE GIỎ HÀNG
    const updateCartBadge = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/cart/user-cart/${userId}`);
            if (res.ok) {
                const data = await res.json();
                const count = data.cartItems?.filter(it => it.quantity > 0).length || 0;
                setCartCount(count);
            }
        } catch (e) { console.error("Lỗi cập nhật badge:", e); }
    }, [apiUrl, userId]);

    useEffect(() => {
        updateCartBadge();
        window.addEventListener('cartUpdated', updateCartBadge);
        return () => window.removeEventListener('cartUpdated', updateCartBadge);
    }, [updateCartBadge]);

    // 2. CLICK RA NGOÀI ĐỂ ĐÓNG GỢI Ý & USER MENU
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. FETCH DỮ LIỆU SẢN PHẨM
    const fetchData = useCallback(async (isMounted) => {
        try {
            setLoading(true);
            const url = query.trim()
                ? `${apiUrl}/search/products?key=${encodeURIComponent(query)}&Index=${currentPage}`
                : `${apiUrl}/products?PageIndex=${currentPage}&pageSize=${pageSize}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Lỗi kết nối");
            const data = await res.json();

            if (isMounted) {
                let rawItems = [];
                let total = 0;

                if (Array.isArray(data)) {
                    rawItems = data;
                    total = data.length;
                } else {
                    rawItems = data.list || data.items || [];
                    total = data.totalProduct || data.totalCount || rawItems.length;
                }

                const mappedFoods = rawItems.map(f => {
                    const images = f.productImageInternalDTOs || f.imageFoods || f.productImageDTOs || [];
                    const mainImage = images.find(img => img.isMain)?.urlImage
                        || images[0]?.urlImage
                        || "https://via.placeholder.com/300";

                    // Thuộc tính quantity/quality (Số lượng xuất còn lại trong ngày từ API)
                    const qty = f.quantity ?? f.quality ?? f.stock ?? 0;


                    return {
                        id: f.id || f.idProduct || f.productId || f.IdProduct || f.id_product,
                        name: f.name,
                        desc: f.description || f.decriptions || "Mỹ vị ngày Tết",
                        price: f.price || 0,
                        img: mainImage,
                        quantity: qty,
                        isAvailable: f.isAvailable ?? true
                    };
                });



                setFoods(mappedFoods);
                setTotalItems(total);
            }
        } catch (err) {
            console.error("Lỗi Fetch:", err);
            if (isMounted) setFoods([]);
        } finally {
            if (isMounted) setLoading(false);
        }
    }, [apiUrl, currentPage, pageSize, query]);

    useEffect(() => {
        let isMounted = true;
        fetchData(isMounted);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return () => { isMounted = false; };
    }, [fetchData]);

    // 4. GỢI Ý TÌM KIẾM
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(`${apiUrl}/search/suggest?Name=${encodeURIComponent(searchTerm)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) { console.error(err); }
        }, 200);
        return () => clearTimeout(timeoutId);
    }, [apiUrl, searchTerm]);

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

    const handleOpenCart = () => window.dispatchEvent(new Event('openCart'));

    // 5. PHÂN TRANG
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
        <div className="menu-page-wrapper tet-mode">
            {/* TRANG TRÍ TẾT */}
            <img src={longdentetImg} alt="Lồng đèn Tết" className="top-lantern-decoration" />
            <img src={hoadaotraiImg} alt="Hoa đào" className="bottom-peach-decoration" />

            {/* TOPBAR HEADER NAV */}
            <header className="topbar">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <BrandLogo size="medium" />
                </Link>

                <nav className="nav-links">
                    <Link to="/home">Trang chủ</Link>
                    <Link to="/menu" className="active-nav">Thực đơn Tết 🧧</Link>

                    {userName ? (
                        <div className="user-nav-container" ref={userMenuRef}>
                            <div className={`user-badge-main ${showUserMenu ? 'active' : ''}`} onClick={() => setShowUserMenu(!showUserMenu)}>
                                <span>Chào, <strong>{userName}</strong> 🧧</span>
                                <span className={`arrow ${showUserMenu ? 'up' : ''}`}>▾</span>
                            </div>

                            {showUserMenu && (
                                <div className="user-dropdown-menu">
                                    <Link to="/profile" className="dropdown-link">👤 Hồ sơ cá nhân</Link>
                                    <Link to="/orders" className="dropdown-link">🛍️ Đơn của bạn</Link>
                                    <div className="divider"></div>
                                    <button onClick={handleLogout} className="btn-logout-item">
                                        🚪 Thoát tài khoản
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login" style={{ borderColor: '#d32f2f', color: '#d32f2f' }}>
                            Đăng nhập
                        </Link>
                    )}

                    <button className="cart-header-btn" onClick={handleOpenCart}>
                        <img src={banhTrungImg} alt="Giỏ Hàng Bánh Chưng" className="cart-icon-img" />
                        {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                    </button>
                </nav>

                {/* Mobile Header Actions */}
                <div className="mobile-header-actions">
                    <button className="cart-header-btn-mobile" onClick={handleOpenCart}>
                        <img src={banhTrungImg} alt="Giỏ Hàng" className="cart-icon-img" />
                        {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                    </button>
                    <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>
                        <span className="burger-icon">☰</span>
                    </button>
                </div>
            </header>

            {/* CONTAINER NỘI DUNG CHÍNH */}
            <div className="menu-page-container">
                <div className="menu-hero-header">
                    <div className="header-text-block">
                        <div className="tet-tag-badge">
                            <Sparkles size={15} /> <span>HÔM NAY BẠN ĂN GÌ </span> <Sparkles size={15} />
                        </div>
                        <h1 className="page-title">🏮 Xuân Về – Bếp Ấm, Nhà Vui</h1>

                    </div>

                    {/* THANH TÌM KIẾM HẬU CẦN */}
                    <div className="search-controls" ref={dropdownRef}>
                        <div className="search-box-wrapper">
                            <Search className="search-icon-inside" size={18} />
                            <input
                                type="text"
                                className="search-input-modern"
                                placeholder="Nhập tên món ăn bạn muốn tìm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="suggestion-dropdown">
                                    {suggestions.map((item, index) => {
                                        const text = typeof item === 'object' ? (item.name || item.text || item.title) : item;
                                        return (
                                            <li key={index} onClick={() => { setSearchTerm(text); setQuery(text); setCurrentPage(1); setShowSuggestions(false); }}>
                                                <span className="s-icon">🌸</span>
                                                <span className="s-text">{text}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                        <button className="btn-action search" onClick={handleSearch}>
                            <Search size={16} /> <span>Khai Lộc</span>
                        </button>
                        <button className="btn-action reset" onClick={handleReset}>
                            <RotateCcw size={16} /> <span>Đặt lại</span>
                        </button>
                    </div>
                </div>

                <hr className="header-divider" />

                {/* DANH SÁCH MÓN ĂN */}
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner">🎋</div>
                        <p>Đang chuẩn bị mâm cỗ khai xuân...</p>
                    </div>
                ) : (
                    <>
                        <div className="food-grid">
                            {foods.length > 0 ? (
                                foods.map(food => (
                                    <FoodCard
                                        key={food.id}
                                        food={food}
                                        onAdd={() => navigate(`/detail/${food.id}`)}
                                    />
                                ))
                            ) : (
                                <div className="no-results-box">
                                    <Flame size={40} className="no-results-icon" />
                                    <h3>Không tìm thấy món "{query}"</h3>
                                    <p>Thử tìm kiếm với từ khóa khác hoặc bấm Đặt lại để xem tất cả món ăn.</p>
                                    <button className="btn-reset-results" onClick={handleReset}>Xem tất cả món ăn</button>
                                </div>
                            )}
                        </div>

                        {/* PHÂN TRANG */}
                        {totalPages > 1 && (
                            <div className="pagination-modern">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-nav">
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="p-numbers-group">{renderPageNumbers()}</div>
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-nav">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* NÚT ĐIỀU HƯỚNG NỔI GÓC DƯỚI */}
            <div className="fixed-nav-group">
                <button className="nav-floating-btn home-btn" onClick={() => navigate('/home')}>
                    <Home size={18} />
                    <span className="label">Trang Chủ</span>
                </button>
                <button className="nav-floating-btn cart" onClick={handleOpenCart}>
                    <img src={banhTrungImg} alt="Giỏ món" className="floating-cart-img" />
                    <span className="label">Giỏ món</span>
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </button>
            </div>

            {/* MOBILE MENU DRAWER */}
            {showMobileMenu && (
                <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
                    <div className="mobile-menu-drawer tet-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header tet-drawer-header">
                            <Link to="/" onClick={() => setShowMobileMenu(false)} style={{ textDecoration: 'none' }}>
                                <BrandLogo size="small" light={true} />
                            </Link>
                            <button className="btn-close-menu tet-close-btn" onClick={() => setShowMobileMenu(false)}>✕</button>
                        </div>

                        <div className="mobile-menu-body tet-drawer-body">
                            {userName && (
                                <div className="mobile-user-card-tet">
                                    <div className="user-avatar-tet">🧧</div>
                                    <div className="user-text-tet">
                                        <div className="user-greeting-tet">Chào xuân, <strong>{userName}</strong> 🌸</div>
                                        <div className="user-sub-tet">Chúc Bạn Năm Mới An Khang!</div>
                                    </div>
                                </div>
                            )}

                            <nav className="mobile-nav-group-tet">
                                <Link to="/home" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                                    <span className="link-icon-tet">🏡</span>
                                    <span className="link-text-tet">Trang chủ Đoàn Viên</span>
                                    <span className="link-arrow-tet">›</span>
                                </Link>

                                <Link to="/menu" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet active">
                                    <span className="link-icon-tet">🧧</span>
                                    <span className="link-text-tet">Thực Đơn Tết 2026</span>
                                    <span className="link-arrow-tet">›</span>
                                </Link>

                                {userName && (
                                    <>
                                        <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                                            <span className="link-icon-tet">👤</span>
                                            <span className="link-text-tet">Hồ sơ cá nhân</span>
                                            <span className="link-arrow-tet">›</span>
                                        </Link>

                                        <Link to="/orders" onClick={() => setShowMobileMenu(false)} className="mobile-menu-link-tet">
                                            <span className="link-icon-tet">🛍️</span>
                                            <span className="link-text-tet">Đơn hàng của bạn</span>
                                            <span className="link-arrow-tet">›</span>
                                        </Link>
                                    </>
                                )}
                            </nav>

                            <div className="mobile-menu-divider-tet"></div>

                            {userName ? (
                                <button
                                    onClick={handleLogout}
                                    className="btn-mobile-logout-tet"
                                >
                                    🚪 Thoát tài khoản
                                </button>
                            ) : (
                                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="btn-mobile-login-tet">
                                    🔑 ĐĂNG NHẬP KHAI XUÂN
                                </Link>
                            )}

                            <div className="mobile-drawer-greeting-box">
                                <span>🏮 CHÚC MỪNG NĂM MỚI 🏮</span>
                                <p>Vạn Sự Như Ý • Đại Cát Đại Lộc</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER ĐỒNG BỘ NỀN TẢNG */}
            <footer className="homepage-footer-wrapper">
                <div className="footer-main-container">
                    <div className="footer-main-grid">
                        <div className="footer-col footer-brand-col">
                            <div className="footer-logo-wrapper" style={{ marginBottom: '12px' }}>
                                <BrandLogo size="medium" />
                            </div>
                            <span className="footer-tagline">⚜️ Ẩm Thực Thượng Hạng — Giao Thần Tốc 15 Phút</span>
                            <p className="footer-brand-desc">
                                Hệ thống đặt đồ ăn ẩm thực cao cấp chuẩn VietGAP 100%, bảo lưu độ nóng bốc khói nguyên bản và phục vụ chuẩn tiêu chuẩn 5 sao.
                            </p>
                        </div>

                        <div className="footer-col">
                            <h4>KHÁM PHÁ & HỖ TRỢ</h4>
                            <ul className="footer-links-list">
                                <li><Link to="/home">Trang Chủ Đoàn Viên</Link></li>
                                <li><Link to="/menu">Thực Đơn Tết 2026</Link></li>
                                <li><Link to="/orders">Theo Dõi Đơn Hàng</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col footer-contact-col">
                            <h4>THÔNG TIN LIÊN HỆ</h4>
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <div>123 Phố Huế, Hai Bà Trưng, Hà Nội | 456 Nguyễn Thị Minh Khai, Q.1, TP.HCM</div>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <div><strong>Hotline 24/7:</strong> <a href="tel:19008888" className="phone-link">1900 8888</a></div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom-bar">
                        <div className="copyright-text">
                            © 2026 <strong>TRUNGDUCFOODLY</strong> — Phát triển bởi <strong>Phạm Trung Đức</strong>.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
