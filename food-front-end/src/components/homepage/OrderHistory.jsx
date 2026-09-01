import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import khungOrderImg from '../../assets/khungOrder.jpg';
import './OrderHistory.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isPageChanging, setIsPageChanging] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // QR Payment states
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeValue, setQrCodeValue] = useState("");
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentOrderCode, setPaymentOrderCode] = useState("");

 const apiUrl = import.meta.env.VITE_API_URL;
    const userId = localStorage.getItem("userId") || "22EBC352-0CA9-4CB6-AC82-3CEA7C8099B2";
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchOrders(pageIndex);
    }, [pageIndex, userId]);

    const handlePayAgain = (orderCode) => {
        setPaymentOrderCode(orderCode);
        setShowQRModal(true);
        setIsGeneratingQR(true);
        setQrCodeValue("");
        setPaymentError(null);

        fetch(`${apiUrl}/payments/qrcode/${orderCode}`, {
            method: 'GET',
            headers: { 
                'Authorization': token ? `Bearer ${token}` : ''
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Không thể tạo mã QR thanh toán.");
            }
            return res.json();
        })
        .then(data => {
            if (data && data.qrCode) {
                setQrCodeValue(data.qrCode);
            } else {
                throw new Error("Không nhận được mã QR hợp lệ từ hệ thống.");
            }
        })
        .catch(err => {
            console.error("Lỗi tạo QR:", err);
            setPaymentError(err.message || "Đã xảy ra lỗi khi tạo mã QR.");
        })
        .finally(() => {
            setIsGeneratingQR(false);
        });
    };

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

    const fetchOrders = (page, isFirst = false) => {
        if (isFirst) setInitialLoading(true);
        else setIsPageChanging(true);

        fetch(`${apiUrl}/orders/histories`, {
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
        })
        .catch(err => console.error("Lỗi tải đơn hàng:", err))
        .finally(() => {
            setInitialLoading(false);
            setIsPageChanging(false);
        });
    };

    const handleViewDetail = (orderId) => {
        fetch(`${apiUrl}/orders/detail`, {
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

            <main className="tet-order-frame-wrapper">
                <img src={khungOrderImg} alt="Khung đơn hàng" className="tet-order-frame-bg" />
                <div className="tet-order-frame-content">
                    <h2 className="section-title-tet">🧧 LỊCH SỬ ĐƠN HÀNG 🧧</h2>

                    {initialLoading ? (
                        <div className="loading-state">🌸 Đang tải danh sách đơn hàng...</div>
                    ) : (
                        <div className={`table-responsive ${isPageChanging ? 'changing-page' : ''}`}>
                            {isPageChanging && (
                                <div className="page-change-overlay">
                                    <div className="qr-spinner-fixed" />
                                </div>
                            )}
                            <table className="tet-table">
                                <thead>
                                    <tr>
                                        <th className="col-order-code">Mã Đơn</th>
                                        <th className="col-date">Ngày Đặt</th>
                                        <th>Tổng Tiền</th>
                                        <th className="col-payment-status">Thanh Toán</th>
                                        <th>Vận Chuyển</th>
                                        <th className="col-action">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr 
                                            key={order.idOrder}
                                            className="order-row-clickable"
                                            onClick={() => handleViewDetail(order.idOrder)}
                                            title="Bấm vào để xem chi tiết đơn hàng"
                                        >
                                            <td className="code-highlight col-order-code">#{order.orderCode}</td>
                                            <td className="col-date">{new Date(order.createAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="price-column">
                                                {order.totalPrice?.toLocaleString()}đ
                                            </td>
                                            <td className="col-payment-status">
                                                <span className={`status-pill ${getPaymentStatus(order.orderStatusPayment).class}`}>
                                                    {getPaymentStatus(order.orderStatusPayment).text}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${getOrderStatus(order.orderStatus).class}`}>
                                                    {getOrderStatus(order.orderStatus).text}
                                                </span>
                                            </td>
                                            <td className="col-action">
                                                <div className="action-buttons-cell">
                                                    <button className="view-detail-btn desktop-only" onClick={(e) => { e.stopPropagation(); handleViewDetail(order.idOrder); }}>
                                                        Xem chi tiết 📜
                                                    </button>
                                                    {order.orderStatusPayment === 1 && (
                                                        <button className="pay-btn" onClick={(e) => { e.stopPropagation(); handlePayAgain(order.orderCode); }}>
                                                            Thanh toán 💳
                                                        </button>
                                                    )}
                                                </div>
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

                        <div className="modal-footer-fixed flex-footer">
                            {selectedOrder.orderStatusPayments === 1 && (
                                <button 
                                    className="btn-pay-now" 
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        handlePayAgain(selectedOrder.orderCode);
                                    }}
                                >
                                    THANH TOÁN LẠI 💳
                                </button>
                            )}
                            <button className="btn-close-final" onClick={() => setSelectedOrder(null)}>ĐÓNG</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL QR (PayOS) --- */}
            {showQRModal && (
                <div className="qr-modal-overlay-fixed" onClick={() => setShowQRModal(false)}>
                    <div className="qr-modal-content-fixed" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-x-fixed" onClick={() => setShowQRModal(false)}>×</button>
                        <h2>Quét mã thanh toán</h2>
                        <p className="qr-subtitle">Đơn hàng: #{paymentOrderCode}</p>
                        
                        <div className="qr-code-wrapper-fixed">
                            {isGeneratingQR ? (
                                <div className="qr-spinner-container-fixed">
                                    <div className="qr-spinner-fixed"></div>
                                    <p>Đang tạo mã thanh toán...</p>
                                </div>
                            ) : paymentError ? (
                                <div className="qr-error-container-fixed">
                                    <span className="qr-error-icon-fixed">⚠️</span>
                                    <p>{paymentError}</p>
                                </div>
                            ) : (
                                qrCodeValue && <QRCodeCanvas value={qrCodeValue} size={220} />
                            )}
                        </div>
                        
                        <p className="qr-instruction-fixed">🔔 Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã</p>
                        
                        <button 
                            className="btn-confirm-next-fixed"
                            onClick={() => {
                                setShowQRModal(false);
                                fetchOrders(pageIndex); // Refresh order list to get updated status
                            }}
                        >
                            TÔI ĐÃ THANH TOÁN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}