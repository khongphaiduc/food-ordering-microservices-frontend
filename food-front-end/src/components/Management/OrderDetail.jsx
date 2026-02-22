import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Phone, MapPin, User, CreditCard, Package } from 'lucide-react';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const ORDER_STATUS_CONFIG = {
        0: { label: "Chờ xử lý", class: "st-0" },
        1: { label: "Đã xác nhận", class: "st-1" },
        2: { label: "Đang chuẩn bị", class: "st-2" },
        3: { label: "Đang giao", class: "st-3" },
        4: { label: "Hoàn thành", class: "st-4" },
        5: { label: "Đã hủy", class: "st-5" }
    };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await axios.get(`https://localhost:7150/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data);
            } catch (err) {
                console.error("Lỗi lấy chi tiết đơn hàng", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id]);

    if (loading) return <div className="order-loader">Đang tải dữ liệu...</div>;
    if (!order) return <div className="order-error">Không tìm thấy đơn hàng!</div>;

    return (
        <div className="detail-container">
            {/* Action Bar */}
            <div className="detail-action-bar">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <div className="header-title">
                    <h2>Đơn hàng #{order.orderCode}</h2>
                    <span className={`detail-status-badge ${ORDER_STATUS_CONFIG[order.orderStatus].class}`}>
                        {ORDER_STATUS_CONFIG[order.orderStatus].label}
                    </span>
                </div>
                <button className="btn-print" onClick={() => window.print()}>
                    <Printer size={18} /> In hóa đơn
                </button>
            </div>

            <div className="detail-content-grid">
                {/* Cột trái: Sản phẩm & Vận chuyển */}
                <div className="detail-main-col">
                    {/* Danh sách sản phẩm */}
                    <div className="detail-card">
                        <h3 className="section-title"><Package size={18} /> Danh sách sản phẩm</h3>
                        <div className="order-items-list">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th className="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderItemDetail.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="item-info">
                                                    <span className="item-name">{item.nameProduct}</span>
                                                    <span className="item-variant">{item.nameVariant}</span>
                                                </div>
                                            </td>
                                            <td>{item.pricePerProduct.toLocaleString()}đ</td>
                                            <td>x{item.quantity}</td>
                                            <td className="text-right">{item.totalPrice.toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Thông tin vận chuyển */}
                    <div className="detail-card">
                        <h3 className="section-title"><MapPin size={18} /> Thông tin vận chuyển</h3>
                        <div className="shipping-info">
                            <div className="info-row">
                                <span className="label">Người nhận:</span>
                                <span className="value">{order.orderDeliveryInfor.reciveName}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Số điện thoại:</span>
                                <span className="value highlight-blue">{order.orderDeliveryInfor.recivePhoneNumber}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Địa chỉ:</span>
                                <span className="value">{order.orderDeliveryInfor.address}</span>
                            </div>
                            {order.orderDeliveryInfor.note && (
                                <div className="note-area">
                                    <label>Ghi chú:</label>
                                    <p>{order.orderDeliveryInfor.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cột phải: Thanh toán & Khách hàng */}
                <div className="detail-sidebar">
                    <div className="detail-card">
                        <h3 className="section-title"><CreditCard size={18} /> Thanh toán</h3>
                        <div className="payment-summary">
                            <div className="pay-row">
                                <span>Hình thức:</span>
                                <strong>
                                    {order.paymentMethod === 1 ? "PayOS" : order.paymentMethod === 2 ? "Tiền mặt" : "VNPay"}
                                </strong>
                            </div>
                            <div className="pay-row">
                                <span>Tạm tính:</span>
                                <span>{order.totalAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="pay-row">
                                <span>Phí vận chuyển:</span>
                                <span>+{order.shipmentAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="pay-row discount">
                                <span>Giảm giá:</span>
                                <span>-{order.discountAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="divider"></div>
                            <div className="pay-row total">
                                <span>TỔNG CỘNG:</span>
                                <span>{order.finalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card customer-info">
                        <h3 className="section-title"><User size={18} /> Khách hàng</h3>
                        <div className="cust-box">
                            <div className="cust-avatar">{order.snapshotNameCustomer.charAt(0)}</div>
                            <div className="cust-details">
                                <p className="cust-name">{order.snapshotNameCustomer}</p>
                                <p className="cust-time">Ngày đặt: {new Date(order.createAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;