import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import * as signalR from '@microsoft/signalr';
import './CreateOrder.css';

export default function ConfirmMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(location.state?.cartData || null);
    const [updatingId, setUpdatingId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(1); // 1: PayOS, 2: Tiền mặt
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // States cho xử lý kết quả
    const [qrCodeValue, setQrCodeValue] = useState(""); 
    const [showQRModal, setShowQRModal] = useState(false);
    const [showCashSuccess, setShowCashSuccess] = useState(false); // Thông báo cho tiền mặt
    const [isPaid, setIsPaid] = useState(false); // Trạng thái cho PayOS
    const [connection, setConnection] = useState(null);

    const token = localStorage.getItem("accessToken");

    // --- 1. Khởi tạo SignalR (Chỉ dành cho PayOS) ---
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7251/notificationPayOS", { 
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);
        return () => { if (newConnection) newConnection.stop(); };
    }, [token]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    connection.on("mynofication", (message) => {
                        setIsPaid(true);
                        setTimeout(() => navigate('/order-success'), 3000);
                    });
                })
                .catch(err => console.error("❌ SignalR Error: ", err));
        }
    }, [connection, navigate]);

    // --- 2. Hàm cập nhật số lượng ---
    const updateQuantity = async (productId, variantId, newQuantity) => {
        if (newQuantity < 0) return;
        const loadingKey = variantId ? `${productId}-${variantId}` : productId;
        setUpdatingId(loadingKey);
        try {
            const payload = {
                IdCart: cartData.idCart,
                CartItems: cartData.cartItems.map(item => ({
                    ProductId: item.idProduct,
                    VariantId: item.idVariant || null,
                    Quantity: (item.idProduct === productId && item.idVariant === variantId) ? newQuantity : item.quantity
                }))
            };
            await axios.post(`https://localhost:7150/cart/update-cart`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let updatedItems = newQuantity === 0 
                ? cartData.cartItems.filter(item => !(item.idProduct === productId && item.idVariant === variantId))
                : cartData.cartItems.map(item => (item.idProduct === productId && item.idVariant === variantId) ? { ...item, quantity: newQuantity } : item);
            
            const newTotal = updatedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
            setCartData({ ...cartData, cartItems: updatedItems, totalCart: newTotal });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            alert("Lỗi cập nhật số lượng!");
        } finally { setUpdatingId(null); }
    };

    // --- 3. Hàm xử lý đặt hàng chính ---
    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const orderPayload = {
                IdCart: cartData.idCart,
                PaymentMethod: paymentMethod 
            };

            const response = await axios.post(`https://localhost:7150/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = response.data; 

            if (paymentMethod === 1) {
                // TRƯỜNG HỢP PAYOS
                setQrCodeValue(result);
                setIsPaid(false);
                setShowQRModal(true);
                window.dispatchEvent(new Event('cartUpdated')); 
            } 
            else if (paymentMethod === 2 && result === "Success") {
                // TRƯỜNG HỢP TIỀN MẶT THÀNH CÔNG
                setShowCashSuccess(true); // Hiện thông báo thành công
                window.dispatchEvent(new Event('cartUpdated'));
                
                // Đợi 2 giây để user thấy thông báo rồi mới chuyển trang
                setTimeout(() => {
                    navigate('/order-success');
                }, 2000);
            } else {
                alert("Lỗi hệ thống: " + result);
            }
        } catch (error) {
            alert("Đặt hàng thất bại, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cartData || cartData.cartItems.length === 0) {
        return <div className="confirm-empty"><p>Giỏ hàng trống.</p><button onClick={() => navigate('/')}>Quay lại</button></div>;
    }

    return (
        <div className="confirm-container">
            <header className="confirm-header">
                <button onClick={() => navigate(-1)} className="btn-back">← QUAY LẠI</button>
                <h1>Xác nhận đơn hàng</h1>
            </header>

            <div className="confirm-content">
                <div className="items-list">
                    {cartData.cartItems.map((item) => {
                        const itemKey = item.idVariant ? `${item.idProduct}-${item.idVariant}` : item.idProduct;
                        return (
                            <div key={itemKey} className="confirm-item">
                                <img src={item.urlImage} alt={item.nameProduct} className="item-img" />
                                <div className="item-info">
                                    <h3>{item.nameProduct}</h3>
                                    <p className="item-price">{item.price.toLocaleString('vi-VN')}đ</p>
                                </div>
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity - 1)}>
                                        {item.quantity === 1 ? '🗑️' : '−'}
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity + 1)}>+</button>
                                </div>
                                <div className="item-subtotal">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h3>Thanh toán</h3>
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 1 ? 'active' : ''}`}>
                            <input type="radio" checked={paymentMethod === 1} onChange={() => setPaymentMethod(1)} />
                            <span>💳 Chuyển khoản (PayOS)</span>
                        </label>
                        <label className={`payment-option ${paymentMethod === 2 ? 'active' : ''}`}>
                            <input type="radio" checked={paymentMethod === 2} onChange={() => setPaymentMethod(2)} />
                            <span>💵 Tiền mặt khi nhận hàng</span>
                        </label>
                    </div>
                    <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span className="price-big">{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button className="btn-checkout-final" onClick={handleCheckout} disabled={isSubmitting}>
                        {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                    </button>
                </div>
            </div>

            {/* --- MODAL HIỂN THỊ QR (CHO PAYOS) --- */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        {!isPaid ? (
                            <>
                                <button className="modal-close-x" onClick={() => setShowQRModal(false)}>×</button>
                                <h2>Quét mã thanh toán</h2>
                                <div className="qr-code-wrapper">
                                    <QRCodeCanvas value={qrCodeValue} size={220} />
                                </div>
                                <p>🔔 Đang chờ xác nhận giao dịch...</p>
                            </>
                        ) : (
                            <div className="success-anim">
                                <h2>Thanh toán thành công!</h2>
                                <p>Đang chuyển hướng...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- THÔNG BÁO THÀNH CÔNG (CHO TIỀN MẶT) --- */}
            {showCashSuccess && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        <div className="payment-success-content">
                            <div className="success-checkmark">
                                <svg className="checkmark-svg" viewBox="0 0 100 100">
                                    <circle className="checkmark-circle" cx="50" cy="50" r="45" fill="none"/>
                                    <path className="checkmark-check" fill="none" d="M30 50 L45 65 L70 35"/>
                                </svg>
                            </div>
                            <h2 className="success-title">Đặt hàng thành công!</h2>
                            <p className="success-msg">Đơn hàng của bạn đã được ghi nhận. Vui lòng chuẩn bị tiền mặt khi nhận hàng.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}