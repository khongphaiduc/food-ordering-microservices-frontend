import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderHistory.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State cho chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Lấy UserId và Token từ localStorage
    const userId = localStorage.getItem("userId") || "22EBC352-0CA9-4CB6-AC82-3CEA7C8099B2";
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchOrders(pageIndex);
    }, [pageIndex, userId]);

    // 1. Gọi API danh sách đơn hàng có Token
    const fetchOrders = (page) => {
        setLoading(true);
        fetch(`https://localhost:7150/orders/histories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '' // THÊM TOKEN
            },
            body: JSON.stringify({
                IdUser: userId,
                PageIndex: page
            })
        })
        .then(res => {
            if (res.status === 401) throw new Error("Unauthorized");
            return res.json();
        })
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

    // 2. Gọi API chi tiết đơn hàng có Token
    const handleViewDetail = (orderId) => {
        setDetailLoading(true);
        fetch(`https://localhost:7150/orders/detail`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '' // THÊM TOKEN
            },
            body: JSON.stringify({
                IdUser: userId,
                IdOrder: orderId
            })
        })
        .then(res => {
            if (res.status === 401) throw new Error("Unauthorized");
            return res.json();
        })
        .then(data => {
            setSelectedOrder(data);
            setDetailLoading(false);
        })
        .catch(err => {
            console.error("Lỗi lấy chi tiết:", err);
            setDetailLoading(false);
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
                            <p className="loading-text">Đang tra cứu hóa đơn cũ...</p>
                        </div>
                    ) : (
                        <div className="order-table-container">
                            <table className="tet-table">
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Thời Gian</th>
                                        <th>Giá Tiền</th>
                                        <th>Trạng Thái Thanh Toán</th>
                                        <th>Hành Động</th>
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
                                            <td>
                                                <button className="view-detail-btn" onClick={() => handleViewDetail(order.idOrder)}>
                                                    Xem chi tiết📜
                                                </button>
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

                            {/* PHÂN TRANG */}
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

            {/* Modal Chi Tiết Đơn Hàng */}
            {selectedOrder && (
                <div className="tet-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="tet-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedOrder(null)}>✖</button>
                        <h3 className="modal-title">📜 Chi Tiết Đơn Hàng</h3>
                        
                        <div className="order-info-summary">
                            <p>Thanh toán: <b className="payment-highlight">
                                {selectedOrder.paymentMethod === 1 ? "Chuyển khoản 💳" : "Tiền mặt 💵"}
                            </b></p>
                            <p>Trạng thái: <b>{selectedOrder.orderStatus === 1 ? "Đang xử lý" : "Hoàn thành"}</b></p>
                        </div>

                        <div className="items-list">
                            {selectedOrder.orderItems.map((item, idx) => (
                                <div key={idx} className="item-detail-row">
                                    <div className="item-name">
                                        <b>{item.productName}</b>
                                        {item.variantname && <span className="variant-text">({item.variantname})</span>}
                                    </div>
                                    <div className="item-qty">x{item.quantity}</div>
                                    <div className="item-price">{item.totalPrice.toLocaleString()}đ</div>
                                </div>
                            ))}
                        </div>

                        <div className="order-total-section">
                            <div className="total-row">
                                <span>Phí vận chuyển:</span>
                                <span>{selectedOrder.shippingFee.toLocaleString()}đ</span>
                            </div>
                            <div className="total-row">
                                <span>Giảm giá:</span>
                                <span>-{selectedOrder.discountAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Tổng cộng:</span> 
                                <span>{selectedOrder.totalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <p>Cung Chúc Tân Xuân - Cảm ơn quý khách! 🧧</p>
                        </div>
                    </div>
                </div>
            )}
            
            {detailLoading && (
                <div className="tet-modal-overlay">
                    <div className="loading-state">
                        <p className="spinning-flower">🌸</p>
                        <p className="loading-text" style={{color: 'white'}}>Đang mở hóa đơn...</p>
                    </div>
                </div>
            )}
        </div>
    );
}