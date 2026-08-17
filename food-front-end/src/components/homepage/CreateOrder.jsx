import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import * as signalR from '@microsoft/signalr';
import './CreateOrder.css';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export default function ConfirmMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(location.state?.cartData || null);
    const [updatingId, setUpdatingId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(1); // 1: PayOS, 2: Tiền mặt
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    // --- States cho Địa chỉ ---
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);

    // --- States cho xử lý kết quả ---
    const [qrCodeValue, setQrCodeValue] = useState("");
    const [showQRModal, setShowQRModal] = useState(false);
    const [showCashSuccess, setShowCashSuccess] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [connection, setConnection] = useState(null);
    const [checkoutError, setCheckoutError] = useState(null);

    // --- State lưu Idempotency Key (chỉ dùng cho lần retry cùng thao tác) ---
    const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState(null);

    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    // --- 1. Lấy thông tin địa chỉ User ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId || !token) {
                setLoadingAddress(false);
                return;
            }
            try {
                const response = await axios.get(`${apiUrl}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const addrList = response.data.addressUsers || [];
                setAddresses(addrList);
                if (addrList.length > 0) {
                    setSelectedAddressId(addrList[0].idAddressItem);
                }
            } catch (error) {
                console.error("Lỗi lấy địa chỉ:", error);
            } finally {
                setLoadingAddress(false);
            }
        };
        fetchUserData();
    }, [userId, token, apiUrl]);

    // --- 2. Khởi tạo SignalR ---
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiUrl}/notificationPayOS`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);
        return () => { if (newConnection) newConnection.stop(); };
    }, [token, apiUrl]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    connection.on("mynofication", (message) => {
                        setIsPaid(true);
                    });
                })
                .catch(err => console.error("❌ SignalR Error: ", err));
        }
    }, [connection]);

    // --- 3. Hàm cập nhật số lượng ---
    const updateQuantity = async (productId, variantId, newQuantity) => {
        if (newQuantity < 0) return;
        const loadingKey = variantId ? `${productId}-${variantId}` : productId;
        setUpdatingId(loadingKey);

        // Làm mới Idempotency Key khi giỏ hàng có sự thay đổi
        setCurrentIdempotencyKey(null);

        try {
            const payload = {
                IdCart: cartData.idCart,
                CartItems: cartData.cartItems.map(item => ({
                    ProductId: item.idProduct,
                    VariantId: item.idVariant || null,
                    Quantity: (item.idProduct === productId && item.idVariant === variantId) ? newQuantity : item.quantity
                }))
            };
            await axios.post(`${apiUrl}/cart/update-cart`, payload, {
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
        } finally {
            setUpdatingId(null);
        }
    };

    // Thay đổi địa chỉ hoặc PTTT cũng làm mới Idempotency Key
    const handleAddressChange = (id) => {
        setSelectedAddressId(id);
        setCurrentIdempotencyKey(null);
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setCurrentIdempotencyKey(null);
    };

    // --- 4. Hàm xử lý đặt hàng với Idempotency Key chuẩn ---
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            setCheckoutError("Vui lòng chọn địa chỉ giao hàng!");
            return;
        }

        setIsSubmitting(true);
        setCheckoutError(null);

        // Sử dụng key hiện tại nếu là lần retry sau sự cố mạng, hoặc tạo key mới hoàn toàn
        const requestKey = currentIdempotencyKey || generateUUID();
        setCurrentIdempotencyKey(requestKey);

        try {
            const orderPayload = {
                IdCart: cartData.idCart,
                PaymentMethod: paymentMethod,
                IdAddress: selectedAddressId
            };

            const response = await axios.post(`${apiUrl}/orders`, orderPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Idempotency-Key": requestKey
                }
            });

            const result = response.data;
            const isSuccess = result?.statusCreateOrder ?? result?.StatusCreateOrder;
            const message = result?.message ?? result?.Message;
            const qrCode = result?.qrCodeString ?? result?.QRCodeString;

            if (isSuccess) {
                // Đặt hàng thành công -> Xóa key đã hoàn tất
                setCurrentIdempotencyKey(null);

                if (paymentMethod === 1) {
                    if (qrCode) {
                        setQrCodeValue(qrCode);
                        setIsPaid(false);
                        setShowQRModal(true);
                        window.dispatchEvent(new Event('cartUpdated'));
                    } else {
                        setCheckoutError("Lỗi hệ thống: Không thể khởi tạo mã QR thanh toán PayOS.");
                    }
                } else if (paymentMethod === 2) {
                    setShowCashSuccess(true);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
            } else {
                // Thất bại do logic nghiệp vụ từ backend -> Làm mới key cho lần thử sau
                setCurrentIdempotencyKey(null);
                setCheckoutError("Đặt hàng thất bại: " + (message || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);

            const errorData = error.response?.data;
            const status = error.response?.status;
            const isReservationFailed = errorData?.errorCode === "INVENTORY_RESERVATION_FAILED" || errorData?.ErrorCode === "INVENTORY_RESERVATION_FAILED";
            const errorMsg = errorData?.message ?? errorData?.Message;

            // Phân loại lỗi để giữ hoặc làm mới Idempotency Key
            if (!status || status >= 500) {
                // Lỗi mạng hoặc 5xx/Timeout: GIỮ NGUYÊN requestKey để nếu user bấm lại sẽ retry đúng giao dịch đó
                setCurrentIdempotencyKey(requestKey);
            } else {
                // Lỗi 4xx (Hết hàng, sai dữ liệu...): LÀM MỚI key để tránh cache lỗi cũ
                setCurrentIdempotencyKey(null);
            }

            if (isReservationFailed) {
                setCheckoutError("Đặt hàng thất bại: " + (errorMsg || "Không đủ số lượng sản phẩm trong kho (Đặt chỗ tồn kho thất bại)."));
            } else if (errorMsg) {
                setCheckoutError("Đặt hàng thất bại: " + errorMsg);
            } else {
                setCheckoutError("Đặt hàng thất bại, vui lòng thử lại.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cartData || cartData.cartItems.length === 0) {
        return (
            <div className="confirm-empty">
                <p>Giỏ hàng trống.</p>
                <button onClick={() => navigate('/')}>Quay lại</button>
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
                <div className="left-column">
                    <div className="address-section">
                        <div className="section-title-box">
                            <h3>📍 Địa chỉ giao hàng</h3>
                            <button className="btn-link" onClick={() => navigate('/profile')}>Quản lý địa chỉ</button>
                        </div>

                        {loadingAddress ? (
                            <p>Đang tải địa chỉ...</p>
                        ) : addresses.length > 0 ? (
                            <div className="address-grid">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.idAddressItem}
                                        className={`address-card ${selectedAddressId === addr.idAddressItem ? 'active' : ''}`}
                                        onClick={() => handleAddressChange(addr.idAddressItem)}
                                    >
                                        <div className="check-icon">{selectedAddressId === addr.idAddressItem && "✓"}</div>
                                        <div className="addr-info">
                                            <p className="addr-line-main">{addr.line1}, {addr.line2}</p>
                                            <p className="addr-line-sub">{addr.region}, {addr.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-address-text">⚠️ Bạn chưa có địa chỉ. Vui lòng thêm trong hồ sơ.</p>
                        )}
                    </div>

                    <div className="items-list">
                        <h3>🛒 Sản phẩm đã chọn</h3>
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
                                        <button
                                            disabled={updatingId === itemKey}
                                            onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity - 1)}
                                        >
                                            {item.quantity === 1 ? '🗑️' : '−'}
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            disabled={updatingId === itemKey}
                                            onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="item-subtotal">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="order-summary">
                    <h3>Thanh toán</h3>
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 1 ? 'active' : ''}`}>
                            <input
                                type="radio"
                                checked={paymentMethod === 1}
                                onChange={() => handlePaymentMethodChange(1)}
                            />
                            <span>💳 Chuyển khoản (PayOS)</span>
                        </label>
                        <label className={`payment-option ${paymentMethod === 2 ? 'active' : ''}`}>
                            <input
                                type="radio"
                                checked={paymentMethod === 2}
                                onChange={() => handlePaymentMethodChange(2)}
                            />
                            <span>💵 Tiền mặt khi nhận hàng</span>
                        </label>
                    </div>
                    <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span className="price-big">{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button
                        className="btn-checkout-final"
                        onClick={handleCheckout}
                        disabled={isSubmitting || !selectedAddressId}
                    >
                        {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                    </button>
                    {!selectedAddressId && <p className="error-small">Vui lòng chọn địa chỉ để đặt hàng</p>}
                </div>
            </div>

            {/* --- MODAL QR (PayOS) --- */}
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
                                <div className="success-checkmark">
                                    <svg className="checkmark-svg" viewBox="0 0 100 100">
                                        <circle className="checkmark-circle" cx="50" cy="50" r="45" fill="none" />
                                        <path className="checkmark-check" fill="none" d="M30 50 L45 65 L70 35" />
                                    </svg>
                                </div>
                                <h2>Thanh toán thành công!</h2>
                                <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
                                <button className="btn-confirm-next" onClick={() => navigate('/order-success')}>
                                    TIẾP TỤC
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL TIỀN MẶT --- */}
            {showCashSuccess && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        <div className="payment-success-content">
                            <div className="success-checkmark">
                                <svg className="checkmark-svg" viewBox="0 0 100 100">
                                    <circle className="checkmark-circle" cx="50" cy="50" r="45" fill="none" />
                                    <path className="checkmark-check" fill="none" d="M30 50 L45 65 L70 35" />
                                </svg>
                            </div>
                            <h2 className="success-title">Đặt hàng thành công!</h2>
                            <p className="success-msg">Đơn hàng đã được ghi nhận. Vui lòng chuẩn bị tiền mặt khi nhận hàng.</p>
                            <button className="btn-confirm-next" onClick={() => navigate('/order-success')}>
                                XÁC NHẬN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL LỖI ĐẶT HÀNG --- */}
            {checkoutError && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content error-modal">
                        <button className="modal-close-x" onClick={() => setCheckoutError(null)}>×</button>
                        <div className="error-checkmark">
                            <svg className="checkmark-svg" viewBox="0 0 100 100">
                                <circle className="checkmark-circle error-circle" cx="50" cy="50" r="45" fill="none" />
                                <path className="checkmark-check error-line1" fill="none" d="M35 35 L65 65" />
                                <path className="checkmark-check error-line2" fill="none" d="M65 35 L35 65" />
                            </svg>
                        </div>
                        <h2 className="error-title">Đặt hàng thất bại</h2>
                        <p className="error-msg">{checkoutError}</p>
                        <button className="btn-confirm-next error-btn" onClick={() => setCheckoutError(null)}>
                            ĐÓNG
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}