import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import * as signalR from '@microsoft/signalr';
import {
    MapPin,
    ShoppingBag,
    ArrowLeft,
    Check,
    Plus,
    Minus,
    Trash2,
    Sparkles,
    PartyPopper,
    CreditCard,
    AlertTriangle,
    Loader2
} from 'lucide-react';

import longdentetImg from '../../assets/longdentet.png';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import iconloginhoaImg from '../../assets/iconloginhoa.png';
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
    const paymentMethod = 1; // 1: PayOS, 2: Tiền mặt (Mặc định)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";

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
    const [qrConnection, setQrConnection] = useState(null);
    const [orderUserConnection, setOrderUserConnection] = useState(null);
    const [checkoutError, setCheckoutError] = useState(null);

    // --- State lưu Idempotency Key ---
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
        const paymentServiceUrl = apiUrl;
        const orderServiceUrl = apiUrl;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${paymentServiceUrl}/notificationPayOS`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);

        const newQrConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${paymentServiceUrl}/QRCodeOrder`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        setQrConnection(newQrConnection);

        const newOrderUserConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${orderServiceUrl}/orderofuser`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        setOrderUserConnection(newOrderUserConnection);

        return () => {
            if (newConnection) newConnection.stop();
            if (newQrConnection) newQrConnection.stop();
            if (newOrderUserConnection) newOrderUserConnection.stop();
        };
    }, [token, apiUrl]);

    useEffect(() => {
        if (connection) {
            connection.on("mynofication", () => {
                setIsPaid(true);
            });
            connection.start().catch(err => console.error("❌ [SignalR PayOS] Lỗi kết nối:", err));
        }
    }, [connection]);

    useEffect(() => {
        if (qrConnection) {
            qrConnection.on("ViewQRCodeOrderMethod", (qrCode) => {
                setQrCodeValue(qrCode);
                setShowQRModal(true);
            });
            qrConnection.start().catch(err => console.error("❌ [SignalR QR] Lỗi kết nối:", err));
        }
    }, [qrConnection]);

    useEffect(() => {
        if (orderUserConnection) {
            orderUserConnection.on("OrderPaySuccessfully", (message) => {
                console.log("💰 [SignalR OrderPaySuccessfully]:", message);
                setIsPaid(true);
            });
            orderUserConnection.start().catch(err => console.error("❌ [SignalR OrderOfUser] Lỗi kết nối:", err));
        }
    }, [orderUserConnection]);

    // --- 3. Hàm cập nhật số lượng ---
    const updateQuantity = async (productId, variantId, newQuantity) => {
        if (newQuantity < 0) return;
        const loadingKey = variantId ? `${productId}-${variantId}` : productId;
        setUpdatingId(loadingKey);

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

    const handleAddressChange = (id) => {
        setSelectedAddressId(id);
        setCurrentIdempotencyKey(null);
    };

    // --- 4. Hàm xử lý đặt hàng ---
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            setCheckoutError("Vui lòng chọn địa chỉ nhận lộc Tết!");
            return;
        }

        setIsSubmitting(true);
        setCheckoutError(null);

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

            if (response.status === 200) {
                setCurrentIdempotencyKey(null);

                if (paymentMethod === 1) {
                    setQrCodeValue("");
                    setIsPaid(false);
                    setShowQRModal(true);
                    window.dispatchEvent(new Event('cartUpdated'));
                } else if (paymentMethod === 2) {
                    setShowCashSuccess(true);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
            } else {
                setCurrentIdempotencyKey(null);
                setCheckoutError("Đặt hàng thất bại, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);

            const errorData = error.response?.data;
            const status = error.response?.status;
            const isReservationFailed = errorData?.errorCode === "INVENTORY_RESERVATION_FAILED" || errorData?.ErrorCode === "INVENTORY_RESERVATION_FAILED";
            const errorMsg = errorData?.message ?? errorData?.Message;

            if (!status || status >= 500) {
                setCurrentIdempotencyKey(requestKey);
            } else {
                setCurrentIdempotencyKey(null);
            }

            if (isReservationFailed) {
                setCheckoutError("Đặt hàng thất bại: " + (errorMsg || "Không đủ số lượng món Tết trong kho đãi tiệc."));
            } else if (errorMsg) {
                setCheckoutError("Đặt hàng thất bại: " + errorMsg);
            } else {
                setCheckoutError("Đặt hàng thất bại, vui lòng kiểm tra lại thông tin.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
        return (
            <div className="confirm-empty-tet">
                <div className="empty-icon">🧧</div>
                <h2>Mâm cỗ giỏ hàng đang trống</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Hãy quay lại thực đơn Tết để chọn món ngon đãi tiệc nhé!</p>
                <button className="btn-back-tet" onClick={() => navigate('/menu')}>
                    <ArrowLeft size={18} />
                    <span>Quay lại Thực Đơn Tết</span>
                </button>
            </div>
        );
    }

    return (
        <div className="confirm-container">
            {/* Trang trí góc Tết */}
            <img src={longdentetImg} alt="Lồng đèn Tết" className="confirm-top-lantern" />
            <img src={hoadaotraiImg} alt="Hoa đào" className="confirm-bottom-peach" />

            <div className="confirm-wrapper-inner">
                <header className="confirm-header">
                    <button onClick={() => navigate(-1)} className="btn-back-tet">
                        <ArrowLeft size={18} />
                        <span>QUAY LẠI TẠO ĐƠN</span>
                    </button>

                    <div className="confirm-title-block">
                        <h1> XÁC NHẬN ĐƠN HÀNG TẾT </h1>
                        <p className="confirm-subtitle">Mâm Cỗ Khai Xuân • Đong Đầy Hương Vị Tết Việt</p>
                    </div>

                    <div style={{ width: '140px' }}></div>
                </header>

                <div className="confirm-content">
                    <div className="left-column">
                        {/* 📍 ĐỊA CHỈ GIAO HÀNG */}
                        <div className="address-section">
                            <div className="section-title-box">
                                <h3>
                                    <MapPin size={20} className="text-red" /> Địa Chỉ Nhận Lộc Khai Xuân
                                </h3>
                                <button className="btn-link-tet" onClick={() => navigate('/profile')}>
                                    Quản lý địa chỉ
                                </button>
                            </div>

                            {loadingAddress ? (
                                <p style={{ color: '#8e0000', fontSize: '0.9rem' }}>🎋 Đang tải địa chỉ nhận lộc...</p>
                            ) : addresses.length > 0 ? (
                                <div className="address-grid">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.idAddressItem}
                                            className={`address-card ${selectedAddressId === addr.idAddressItem ? 'active' : ''}`}
                                            onClick={() => handleAddressChange(addr.idAddressItem)}
                                        >
                                            <div className="check-icon-circle">
                                                {selectedAddressId === addr.idAddressItem && <Check size={14} />}
                                            </div>
                                            <div className="addr-info">
                                                <p className="addr-line-main">{addr.line1}, {addr.line2}</p>
                                                <p className="addr-line-sub">{addr.region}, {addr.city}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-address-box">
                                    <AlertTriangle size={18} />
                                    <span>Bạn chưa có địa chỉ nhận hàng. Vui lòng thêm trong hồ sơ cá nhân.</span>
                                </div>
                            )}
                        </div>

                        {/* 🛒 DANH SÁCH MÓN TẾT */}
                        <div className="items-list">
                            <h3>
                                <ShoppingBag size={20} className="text-red" /> Mâm Cỗ Đã Chọn ({cartData.cartItems.length} món)
                            </h3>
                            {cartData.cartItems.map((item) => {
                                const itemKey = item.idVariant ? `${item.idProduct}-${item.idVariant}` : item.idProduct;
                                return (
                                    <div key={itemKey} className="confirm-item">
                                        <div className="item-img-wrapper">
                                            <img src={item.urlImage} alt={item.nameProduct} className="item-img" />
                                        </div>
                                        <div className="item-info">
                                            <h4>{item.nameProduct}</h4>
                                            <p className="item-price">{item.price.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                        <div className="quantity-controls-tet">
                                            <button
                                                className="btn-qty-tet"
                                                disabled={updatingId === itemKey}
                                                onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity - 1)}
                                            >
                                                {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                            </button>
                                            <span className="qty-number">{item.quantity}</span>
                                            <button
                                                className="btn-qty-tet"
                                                disabled={updatingId === itemKey}
                                                onClick={() => updateQuantity(item.idProduct, item.idVariant, item.quantity + 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="item-subtotal">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CỘT THANH TOÁN TỔNG KẾT */}
                    <div className="order-summary-tet">
                        <h3 className="summary-title-tet">
                            <CreditCard size={20} /> Thanh Toán Khai Xuân
                        </h3>

                        <div className="payment-method-box">
                            <span className="pay-label">Phương thức:</span>
                            <span className="pay-val">
                                <CreditCard size={16} /> Chuyển khoản PayOS
                            </span>
                        </div>

                        <div className="summary-details">
                            <div className="sum-row">
                                <span>Tiền hàng mâm cỗ:</span>
                                <span>{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="sum-row">
                                <span>Phí vận chuyển đêm giao thừa:</span>
                                <span className="text-green">FREESHIP 0Đ</span>
                            </div>
                            <div className="sum-row">
                                <span>Lì xì chiết khấu Tết:</span>
                                <span className="text-green">-0đ</span>
                            </div>
                        </div>

                        <div className="summary-row-total">
                            <span className="total-label">Tổng cộng:</span>
                            <span className="price-big-tet">{cartData.totalCart.toLocaleString('vi-VN')}đ</span>
                        </div>

                        <button
                            className="btn-checkout-tet"
                            onClick={handleCheckout}
                            disabled={isSubmitting || !selectedAddressId}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="spin-slow" />
                                    <span>ĐANG XỬ LÝ ĐẶT HÀNG...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} fill="#ffd700" color="#ffd700" />
                                    <span>XÁC NHẬN ĐẶT HÀNG & NHẬN LỘC</span>
                                </>
                            )}
                        </button>

                        {!selectedAddressId && (
                            <p className="error-small-tet">⚠️ Vui lòng chọn địa chỉ nhận lộc để tiếp tục</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL QR (PayOS) --- */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content-tet">
                        {!isPaid ? (
                            <>
                                <button className="modal-close-btn" onClick={() => setShowQRModal(false)}>×</button>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <img src={iconloginhoaImg} alt="Hoa" style={{ width: '24px' }} />
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#8e0000', fontWeight: '800' }}>
                                        Quét Mã Thanh Toán Khai Xuân
                                    </h2>
                                </div>
                                <div className="qr-code-wrapper-tet">
                                    {qrCodeValue ? (
                                        <QRCodeCanvas value={qrCodeValue} size={220} />
                                    ) : (
                                        <div style={{ padding: '40px 20px', color: '#8e0000' }}>
                                            <Loader2 size={32} className="spin-slow mb-2" />
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Đang tạo mã QR PayOS khai xuân...</p>
                                        </div>
                                    )}
                                </div>
                                <p style={{ color: '#616161', fontSize: '0.88rem' }}>
                                    🔔 Hệ thống tự động xác nhận sau khi chuyển khoản thành công...
                                </p>
                                <button
                                    className="btn-confirm-next-tet"
                                    onClick={() => {
                                        setShowQRModal(false);
                                        navigate('/');
                                    }}
                                >
                                    TÔI ĐÃ THANH TOÁN KHAI XUÂN
                                </button>
                            </>
                        ) : (
                            <div className="success-anim">
                                <PartyPopper size={50} style={{ color: '#2e7d32', marginBottom: '15px' }} />
                                <h2 style={{ color: '#2e7d32', fontWeight: '800' }}>Khai Xuân Thành Công! 🎉</h2>
                                <p style={{ color: '#555', fontSize: '0.92rem' }}>
                                    Đơn hàng mâm cỗ Tết của bạn đã được thanh toán thành công. Chúc bạn và gia đình năm mới An Khang Thịnh Vượng!
                                </p>
                                <button className="btn-confirm-next-tet" onClick={() => navigate('/orders')}>
                                    XEM ĐƠN HÀNG CỦA BẠN ➔
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL TIỀN MẶT --- */}
            {showCashSuccess && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content-tet">
                        <PartyPopper size={50} style={{ color: '#2e7d32', marginBottom: '15px' }} />
                        <h2 style={{ color: '#2e7d32', fontWeight: '800' }}>Đặt Hàng Thành Công! 🧧</h2>
                        <p style={{ color: '#555', fontSize: '0.92rem', margin: '10px 0 20px 0' }}>
                            Mâm cỗ Tết của bạn đã được ghi nhận. Vui lòng chuẩn bị tiền mặt khi shipper giao tới.
                        </p>
                        <button className="btn-confirm-next-tet" onClick={() => navigate('/orders')}>
                            XÁC NHẬN & QUẢN LÝ ĐƠN HÀNG
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL LỖI ĐẶT HÀNG --- */}
            {checkoutError && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content-tet">
                        <button className="modal-close-btn" onClick={() => setCheckoutError(null)}>×</button>
                        <AlertTriangle size={48} style={{ color: '#d32f2f', marginBottom: '15px' }} />
                        <h2 style={{ color: '#d32f2f', fontWeight: '800', margin: '0 0 10px 0' }}>Đặt Hàng Thất Bại</h2>
                        <p style={{ color: '#424242', fontSize: '0.92rem', lineHeight: '1.5' }}>{checkoutError}</p>
                        <button className="btn-confirm-next-tet error-btn" onClick={() => setCheckoutError(null)}>
                            ĐÓNG & THỬ LẠI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 