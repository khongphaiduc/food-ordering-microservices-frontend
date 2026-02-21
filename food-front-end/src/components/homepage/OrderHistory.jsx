import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderHistory.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const userId = localStorage.getItem("userId") || "22EBC352-0CA9-4CB6-AC82-3CEA7C8099B2";
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchOrders(pageIndex);
    }, [pageIndex, userId]);

    const getOrderStatus = (status) => {
        switch(status) {
            case 0: return { text: "Chờ xác nhận", class: "order-pending" };
            case 1: return { text: "Đã xác nhận", class: "order-confirmed" };
            case 2: return { text: "Đang chế biến", class: "order-preparing" };
            case 3: return { text: "Đang giao", class: "order-delivering" };
            case 4: return { text: "Hoàn thành", class: "order-completed" };
            case 5: return { text: "Đã hủy", class: "order-cancelled" };
            default: return { text: "N/A", class: "" };
        }
    };

    const getPaymentStatus = (status) => {
        switch(status) {
            case 1: return { text: "Chờ thanh toán", class: "pay-pending" };
            case 2: return { text: "Đã thanh toán", class: "pay-paid" };
            case 3: return { text: "Đã hủy", class: "pay-cancelled" };
            default: return { text: "N/A", class: "" };
        }
    };

    const fetchOrders = (page) => {
        setLoading(true);
        fetch(`https://localhost:7150/orders/histories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ IdUser: userId, PageIndex: page })
        })
        .then(res => res.json())
        .then(data => {
            setOrders(data.orderHistory || []);
            setTotalPages(data.totalPages || 1);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    const handleViewDetail = (orderId) => {
        fetch(`https://localhost:7150/orders/detail`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ IdUser: userId, IdOrder: orderId })
        })
        .then(res => res.json())
        .then(data => setSelectedOrder(data))
        .catch(err => console.error(err));
    };

    return (
        <div className="order-page-wrapper">
            <Link to="/home" className="back-to-home-fixed">
                <span>🔙 Trang chủ</span>
            </Link>

            <main className="tet-border-outer">
                <div className="tet-border-inner">
                    <h2 className="section-title-tet">🧧 LỊCH SỬ ĐƠN HÀNG 🧧</h2>

                    {loading ? (
                        <div className="loading-state">🌸 Đang tải danh sách đơn hàng...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="tet-table">
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Ngày Đặt</th>
                                        <th>Tổng Tiền</th> {/* Thêm cột tổng tiền */}
                                        <th>Thanh Toán</th>
                                        <th>Vận Chuyển</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.idOrder}>
                                            <td className="code-highlight">#{order.orderCode}</td>
                                            <td>{new Date(order.createAt).toLocaleDateString('vi-VN')}</td>
                                            {/* Hiển thị số tiền của order */}
                                            <td className="price-column">
                                                {order.totalPrice?.toLocaleString()}đ
                                            </td>
                                            <td>
                                                <span className={`status-pill ${getPaymentStatus(order.orderStatusPayment).class}`}>
                                                    {getPaymentStatus(order.orderStatusPayment).text}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${getOrderStatus(order.orderStatus).class}`}>
                                                    {getOrderStatus(order.orderStatus).text}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="view-detail-btn" onClick={() => handleViewDetail(order.idOrder)}>
                                                    Xem chi tiết 📜
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <button disabled={pageIndex === 1} onClick={() => setPageIndex(p => p - 1)}>Trước</button>
                                    <span className="page-info">{pageIndex} / {totalPages}</span>
                                    <button disabled={pageIndex === totalPages} onClick={() => setPageIndex(p => p + 1)}>Sau</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {selectedOrder && (
                <div className="modal-overlay-fixed" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content-fixed" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-fixed">
                            <h3>HÓA ĐƠN CHI TIẾT</h3>
                            <button className="modal-close-x" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>
                        
                        <div className="modal-body-fixed">
                            <div className="modal-order-code">#{selectedOrder.orderCode}</div>
                            
                            <div className="modal-status-grid">
                                <div className="status-item-fixed">
                                    <label>ĐƠN HÀNG</label>
                                    <span className={`pill-fixed ${getOrderStatus(selectedOrder.orderStatus).class}`}>
                                        {getOrderStatus(selectedOrder.orderStatus).text}
                                    </span>
                                </div>
                                <div className="status-item-fixed">
                                    <label>THANH TOÁN</label>
                                    <span className={`pill-fixed ${getPaymentStatus(selectedOrder.orderStatusPayments).class}`}>
                                        {getPaymentStatus(selectedOrder.orderStatusPayments).text}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-section-fixed">
                                <h4>📍 Giao đến</h4>
                                <p><strong>{selectedOrder.orderDeliveryDTO?.recipientName}</strong></p>
                                <p>{selectedOrder.orderDeliveryDTO?.deliveryAddress}</p>
                            </div>

                            <div className="modal-section-fixed">
                                <h4>🥐 Chi tiết món</h4>
                                {selectedOrder.orderItems?.map((item, i) => (
                                    <div key={i} className="item-row-fixed">
                                        <span>{item.productName} x{item.quantity}</span>
                                        <strong>{item.totalPrice.toLocaleString()}đ</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-total-fixed">
                                <div className="total-row-fixed">
                                    <span>TỔNG THANH TOÁN:</span>
                                    <span className="total-price-fixed">{selectedOrder.totalPrice.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-fixed">
                            <button className="btn-close-final" onClick={() => setSelectedOrder(null)}>ĐÓNG</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}