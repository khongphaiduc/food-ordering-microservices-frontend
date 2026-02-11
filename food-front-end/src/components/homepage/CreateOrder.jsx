import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // Thư viện tạo QR từ String
import './CreateOrder.css';

export default function ConfirmMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(location.state?.cartData || null);
    const [updatingId, setUpdatingId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(1); // 1: Chuyển khoản, 2: Tiền mặt
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State cho QR Code
    const [qrCodeValue, setQrCodeValue] = useState(""); 
    const [showQRModal, setShowQRModal] = useState(false);

    const token = localStorage.getItem("accessToken");

    // Hàm cập nhật số lượng
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

            let updatedItems;
            if (newQuantity === 0) {
                updatedItems = cartData.cartItems.filter(item => !(item.idProduct === productId && item.idVariant === variantId));
            } else {
                updatedItems = cartData.cartItems.map(item => {
                    if (item.idProduct === productId && item.idVariant === variantId) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
            }

            const newTotal = updatedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
            setCartData({ ...cartData, cartItems: updatedItems, totalCart: newTotal });
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            alert("Lỗi cập nhật số lượng!");
        } finally {
            setUpdatingId(null);
        }
    };

    // Hàm xử lý đặt hàng & Hiển thị QR
    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const orderPayload = {
                IdCart: cartData.idCart,
                PaymentMethod: paymentMethod 
            };

            // Gọi API Order
            const response = await axios.post(`https://localhost:7150/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Lấy string QR từ API trả về (Giả sử response.data chứa chuỗi QR)
            const qrString = response.data; 

            if (paymentMethod === 1 && qrString) {
                // Nếu chọn chuyển khoản -> Hiện QR Modal
                setQrCodeValue(qrString);
                setShowQRModal(true);
                window.dispatchEvent(new Event('cartUpdated')); 
            } else {
                // Nếu là tiền mặt hoặc thanh toán khác
                alert("Đặt hàng thành công!");
                window.dispatchEvent(new Event('cartUpdated'));
                navigate('/order-success');
            }

        } catch (error) {
            console.error("Order error:", error);
            alert("Đặt hàng thất bại, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra giỏ hàng trống
    if (!cartData || cartData.cartItems.length === 0) {
        return (
            <div className="confirm-empty">
                <p>Giỏ hàng của bạn đang trống.</p>
                <button className="btn-back" onClick={() => navigate('/')}>Quay lại cửa hàng</button>
            </div>
        );
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
                        const isLoading = updatingId === itemKey;

                        return (
                            <div key={itemKey} className={`confirm-item ${isLoading ? 'item-loading' : ''}`}>
                                <img src={item.urlImage} alt={item.nameProduct} className="item-img" />
                                <div className="item-info">
                                    <h3 className="item-name">{item.nameProduct}</h3>
                                    {item.nameVariant && <p className="item-variant">{item.nameVariant}</p>}
                                    <p className="item-price">{item.price.toLocaleString('vi-VN')}đ</p>
                                </div>
                                <div className="quantity-controls">
                                    <button 
                                        disabled={isLoading}
                                        onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity - 1)}
                                    >
                                        {item.quantity === 1 ? '🗑️' : '−'}
                                    </button>
                                    <span className="qty-number">{item.quantity}</span>
                                    <button 
                                        disabled={isLoading}
                                        onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity + 1)}
                                    >+</button>
                                </div>
                                <div className="item-subtotal">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h3>Thanh toán</h3>
                    
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 1 ? 'active' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                checked={paymentMethod === 1}
                                onChange={() => setPaymentMethod(1)}
                            />
                            <div className="payment-info">
                                <span className="icon">💳</span>
                                <span>Chuyển khoản</span>
                            </div>
                        </label>

                        <label className={`payment-option ${paymentMethod === 2 ? 'active' : ''}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                checked={paymentMethod === 2}
                                onChange={() => setPaymentMethod(2)}
                            />
                            <div className="payment-info">
                                <span className="icon">💵</span>
                                <span>Thanh toán khi nhận hàng</span>
                            </div>
                        </label>
                    </div>

                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span className="price-big">{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    <button 
                        className="btn-checkout-final" 
                        onClick={handleCheckout}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN THANH TOÁN"}
                    </button>
                </div>
            </div>

            {/* --- MODAL HIỂN THỊ QR CODE --- */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        <button className="modal-close-x" onClick={() => setShowQRModal(false)}>×</button>
                        <h2>Mã QR Thanh Toán</h2>
                        <p>Mở ứng dụng Ngân hàng hoặc Ví điện tử để quét mã bên dưới</p>
                        
                        <div className="qr-code-wrapper">
                            <QRCodeCanvas 
                                value={qrCodeValue} 
                                size={220}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>

                        <div className="qr-modal-actions">
                            <button className="btn-done" onClick={() => navigate('/order-success')}>
                                TÔI ĐÃ THANH TOÁN XONG
                            </button>
                            <p className="qr-note">Hệ thống sẽ xác nhận đơn hàng sau khi nhận được tiền.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}