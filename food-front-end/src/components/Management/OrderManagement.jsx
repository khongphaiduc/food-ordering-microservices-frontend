import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import * as signalR from '@microsoft/signalr';
import { 
    ClipboardCheck, Clock, CheckCircle2, XCircle, 
    Search, ChevronLeft, ChevronRight, Eye, Bell
} from 'lucide-react';
import './OrderManagement.css';

const ORDER_STATUS_CONFIG = {
    0: { label: "Chờ xử lý", class: "st-0" },
    1: { label: "Đã xác nhận", class: "st-1" },
    2: { label: "Đang chuẩn bị", class: "st-2" },
    3: { label: "Đang giao", class: "st-3" },
    4: { label: "Hoàn thành", class: "st-4" },
    5: { label: "Đã hủy", class: "st-5" }
};

const PAYMENT_STATUS_MAP = {
    1: { label: "Chờ thanh toán", class: "pay-wait" },
    2: { label: "Đã thanh toán", class: "pay-done" },
    3: { label: "Đã hủy", class: "pay-cancel" }
};

const PAYMENT_METHOD_MAP = { 1: "PayOS", 2: "Tiền mặt", 3: "VNPay" };

const OrderManagement = () => {
    const navigate = useNavigate(); // Hook để điều hướng
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ confirmation: 0, preparing: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    
    const [filters, setFilters] = useState({
        orderCode: '', orderStatus: '', paymentMethod: '',
        fromDate: '', toDate: '', currentPage: 1, pageSize: 10
    });

    const API_URL = 'https://localhost:7150'; 
    const HUB_URL = 'https://localhost:7264/ordersHub';

    const getAuthToken = () => localStorage.getItem("accessToken");
    const api = axios.create({ baseURL: API_URL });

    api.interceptors.request.use((config) => {
        const token = getAuthToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            );
            const response = await api.get(`/orders`, { params });
            const data = response.data;
            setOrders(data.listOrderDTOs || []);
            setStats({
                confirmation: data.confirmationCount || 0,
                preparing: data.preparingCount || 0,
                completed: data.completedCount || 0,
                cancelled: data.cancelledCount || 0
            });
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    useEffect(() => {
        const token = getAuthToken();
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => {
                connection.on("ReceiveOrder", (newOrder) => {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 5000);

                    setOrders(prev => {
                        if (prev.some(o => o.idOrder === newOrder.idOrder)) return prev;
                        return [{ ...newOrder, isNew: true }, ...prev].slice(0, filters.pageSize);
                    });
                    setStats(prev => ({ ...prev, preparing: prev.preparing + 1 }));
                });
            })
            .catch(err => console.error("SignalR Error:", err));

        return () => { connection.stop(); };
    }, [filters.pageSize]);

    const handleUpdateStatus = async (e, orderId, newStatusValue) => {
        e.stopPropagation(); 
        const newStatus = parseInt(newStatusValue);
        try {
            await api.patch(`/orders`, { idOrder: orderId, status: newStatus });
            setOrders(prev => prev.map(o => o.idOrder === orderId ? { ...o, orderStatus: newStatus } : o));
            fetchOrders(); 
        } catch (error) {
            alert("Lỗi cập nhật trạng thái!");
        }
    };

    // Sửa logic Click hàng: Đánh dấu đã xem và chuyển trang
    const handleRowClick = (orderId) => {
        setOrders(prev => prev.map(o => o.idOrder === orderId ? { ...o, isNew: false } : o));
        navigate(`/management/orders/${orderId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, currentPage: 1 }));
    };

    return (
        <div className="order-container">
            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="order-toast">
                    <div className="toast-body">
                        <div className="toast-icon-wrapper"><Bell size={20} color="#fff" /></div>
                        <div className="toast-content">
                            <span className="toast-title">Đơn hàng mới!</span>
                            <span className="toast-desc">👋 Bạn vừa có một đơn hàng mới.</span>
                        </div>
                        <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
                    </div>
                    <div className="toast-progress-bar"></div>
                </div>
            )}

            {/* STATS GRID */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-inner">
                        <div className="stat-info"><span className="stat-label">Đã xác nhận</span><span className="stat-value">{stats.confirmation}</span></div>
                        <div className="stat-icon-box"><ClipboardCheck size={24} /></div>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-inner">
                        <div className="stat-info"><span className="stat-label">Chờ xác nhận</span><span className="stat-value">{stats.preparing}</span></div>
                        <div className="stat-icon-box"><Clock size={24} /></div>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-inner">
                        <div className="stat-info"><span className="stat-label">Hoàn thành</span><span className="stat-value">{stats.completed}</span></div>
                        <div className="stat-icon-box"><CheckCircle2 size={24} /></div>
                    </div>
                </div>
                <div className="stat-card red">
                    <div className="stat-inner">
                        <div className="stat-info"><span className="stat-label">Đã hủy</span><span className="stat-value">{stats.cancelled}</span></div>
                        <div className="stat-icon-box"><XCircle size={24} /></div>
                    </div>
                </div>
            </div>

            {/* FILTER SECTION */}
            <div className="filter-card">
                <div className="filter-grid">
                    <div className="filter-group">
                        <label>Mã đơn hàng</label>
                        <input name="orderCode" value={filters.orderCode} className="filter-input" placeholder="ORD123..." onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>Trạng thái</label>
                        <select name="orderStatus" value={filters.orderStatus} className="filter-input" onChange={handleFilterChange}>
                            <option value="">Tất cả</option>
                            {Object.entries(ORDER_STATUS_CONFIG).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Phương thức</label>
                        <select name="paymentMethod" value={filters.paymentMethod} className="filter-input" onChange={handleFilterChange}>
                            <option value="">Tất cả</option>
                            {Object.entries(PAYMENT_METHOD_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Từ ngày</label>
                        <input type="date" name="fromDate" value={filters.fromDate} className="filter-input" onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày</label>
                        <input type="date" name="toDate" value={filters.toDate} className="filter-input" onChange={handleFilterChange} />
                    </div>
                    <button className="btn-search-main" onClick={fetchOrders}>
                        <Search size={18} /><span>Tìm kiếm</span>
                    </button>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th><th>Khách hàng</th><th>Phương thức</th><th>Thanh toán</th><th>Trạng thái</th><th>Tổng tiền</th><th className="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="loading-state">Đang tải dữ liệu...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="7" className="loading-state">Không tìm thấy đơn hàng nào.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.idOrder} 
                                    className={`clickable-row ${order.isNew ? "row-flashing" : ""}`} 
                                    onClick={() => handleRowClick(order.idOrder)}
                                >
                                    <td className="font-bold text-blue-600">#{order.orderCode}</td>
                                    <td>
                                        <div className="cust-cell">
                                            <span className="cust-name">{order.nameCustomer || "Khách lẻ"}</span>
                                            <span className="cust-date">{new Date(order.createAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                    </td>
                                    <td><span className="method-tag">{PAYMENT_METHOD_MAP[order.paymentMethod]}</span></td>
                                    <td>
                                        <span className={`pay-status ${PAYMENT_STATUS_MAP[order.orderStatusPayment]?.class}`}>
                                            {PAYMENT_STATUS_MAP[order.orderStatusPayment]?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            className={`status-dropdown ${ORDER_STATUS_CONFIG[order.orderStatus]?.class}`}
                                            value={order.orderStatus}
                                            onChange={(e) => handleUpdateStatus(e, order.idOrder, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </td>
                                    <td className="font-extrabold">{order.totalAmount?.toLocaleString()}đ</td>
                                    <td className="text-right">
                                        <button className="action-view" onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(order.idOrder);
                                        }}>
                                            <Eye size={16} /><span>Chi tiết</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* PAGINATION */}
                <div className="pagination">
                    <p className="page-text">Trang <b>{filters.currentPage}</b></p>
                    <div className="page-btns">
                        <button 
                            disabled={filters.currentPage === 1} 
                            onClick={(e) => { e.stopPropagation(); setFilters({...filters, currentPage: filters.currentPage - 1}) }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setFilters({...filters, currentPage: filters.currentPage + 1}) }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;