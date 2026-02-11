import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderHistory.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Ưu tiên lấy từ localStorage, nếu không có dùng ID mặc định
    const userId = localStorage.getItem("userId") || "22EBC352-0CA9-4CB6-AC82-3CEA7C8099B2";

    useEffect(() => {
        fetchOrders(pageIndex);
    }, [pageIndex, userId]);

    const fetchOrders = (page) => {
        setLoading(true);
        fetch(`https://localhost:7150/orders/histories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                IdUser: userId,
                PageIndex: page
            })
        })
        .then(res => res.json())
        .then(data => {
            setOrders(data.orderHistory || []);
            setTotalPages(data.totalPages || 1);
            setLoading(false);
        })
        .catch(err => {
            console.error("Lỗi API:", err);
            setLoading(false);
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageIndex(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="order-page-wrapper">
            {/* Nút quay về trang chủ - Đã chuyển vị trí trong CSS */}
            <Link to="/home" className="back-to-home-fixed">
                <span className="icon">🔙</span>
                <span className="text">Trang chủ</span>
            </Link>

            <div className="lantern-float l-left">🏮</div>
            <div className="lantern-float l-right">🏮</div>

            <main className="tet-border-outer fade-in-up">
                <div className="tet-border-inner">
                    <div className="tet-title-container">
                        <h2 className="section-title-tet">🧧 Lịch Sử Đặt Đơn 🧧</h2>
                        <p className="tet-wish">Vạn Sự Như Ý - Phát Tài Phát Lộc</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <p className="spinning-flower">🌸</p>
                            <p className="loading-text">Đang tra cứu sớ cũ...</p>
                        </div>
                    ) : (
                        <div className="order-table-container">
                            <table className="tet-table">
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Thời Gian Đặt</th>
                                        <th>Giá Tiền</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr 
                                            key={order.idOrder} 
                                            className="order-row-item"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <td className="code-highlight">#{order.orderCode}</td>
                                            <td>
                                                <div className="order-time-display">
                                                    <span className="time-part">
                                                        {new Date(order.createAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="date-part">
                                                        {new Date(order.createAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="price-highlight">
                                                {order.totalPrice.toLocaleString()}đ
                                            </td>
                                            <td>
                                                <span className={`status-pill ${order.orderStatus === 1 ? 'processing' : 'completed'}`}>
                                                    {order.orderStatus === 1 ? "Đang xử lý" : "Hoàn thành"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {orders.length === 0 && (
                                <div className="empty-state fade-in">
                                    <p>Chưa có đơn hàng nào. Khai xuân ngay thôi! 🧧</p>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="tet-pagination fade-in">
                                    <button 
                                        disabled={pageIndex === 1}
                                        onClick={() => handlePageChange(pageIndex - 1)}
                                        className="pag-btn"
                                    >
                                        « Trước
                                    </button>
                                    <span className="pag-info">
                                        Trang <b>{pageIndex}</b> / {totalPages}
                                    </span>
                                    <button 
                                        disabled={pageIndex === totalPages}
                                        onClick={() => handlePageChange(pageIndex + 1)}
                                        className="pag-btn"
                                    >
                                        Sau »
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}