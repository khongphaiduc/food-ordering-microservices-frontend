import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import {
    ClipboardCheck, Clock, CheckCircle2, XCircle,
    Search, ChevronLeft, ChevronRight, Eye, Bell,
    Sparkles, RefreshCw, Filter, ShoppingBag, Flame,
    SlidersHorizontal, Layers
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
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ confirmation: 0, preparing: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

    const [filters, setFilters] = useState({
        orderCode: '', orderStatus: '', paymentMethod: '',
        fromDate: '', toDate: '', currentPage: 1, pageSize: 10
    });

    const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7264/api';
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
            alert("Lỗi cập nhật trạng thái đơn hàng!");
        }
    };

    const handleRowClick = (orderId) => {
        setOrders(prev => prev.map(o => o.idOrder === orderId ? { ...o, isNew: false } : o));
        navigate(`/management/orders/${orderId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, currentPage: 1 }));
    };

    const handleTabChange = (statusValue) => {
        setFilters(prev => ({ ...prev, orderStatus: statusValue, currentPage: 1 }));
    };

    const handleResetFilters = () => {
        setFilters({
            orderCode: '', orderStatus: '', paymentMethod: '',
            fromDate: '', toDate: '', currentPage: 1, pageSize: 10
        });
    };

    const statusTabs = [
        { key: '', label: 'Tất cả đơn', count: null },
        { key: '0', label: 'Chờ xử lý', count: stats.preparing },
        { key: '1', label: 'Đã xác nhận', count: stats.confirmation },
        { key: '2', label: 'Đang chuẩn bị', count: null },
        { key: '3', label: 'Đang giao', count: null },
        { key: '4', label: 'Hoàn thành', count: stats.completed },
        { key: '5', label: 'Đã hủy', count: stats.cancelled },
    ];

    return (
        <div className="order-container tet-order-theme">
            {/* TOAST NOTIFICATION TET THEME */}
            {showToast && (
                <div className="order-toast tet-toast">
                    <div className="toast-body">
                        <div className="toast-icon-wrapper tet-toast-icon">
                            <Bell size={22} className="bell-ring" />
                        </div>
                        <div className="toast-content">
                            <span className="toast-title"> ĐƠN HÀNG MỚI KHAI XUÂN!</span>
                            <span className="toast-desc"> Vừa phát sinh 1 đơn hàng mới trong hệ thống.</span>
                        </div>
                        <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
                    </div>
                    <div className="toast-progress-bar tet-progress"></div>
                </div>
            )}

            {/* TOOLBAR ACTIONS HEADER & SIGNALR */}


            {/* STATS GRID (BỐ CỤC 1: KPI CARDS TỔNG QUAN) */}
            <div className="stats-grid">
                <div
                    className={`stat-card blue tet-stat-card ${filters.orderStatus === '1' ? 'active-stat' : ''}`}
                    onClick={() => handleTabChange('1')}
                    title="Click để lọc đơn đã xác nhận"
                >
                    <div className="stat-inner">
                        <div className="stat-info">
                            <span className="stat-label">ĐÃ XÁC NHẬN</span>
                            <span className="stat-value">{stats.confirmation}</span>
                            <span className="stat-sublabel"> Đơn đã duyệt</span>
                        </div>
                        <div className="stat-icon-box">
                            <ClipboardCheck size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className={`stat-card orange tet-stat-card ${filters.orderStatus === '0' ? 'active-stat' : ''}`}
                    onClick={() => handleTabChange('0')}
                    title="Click để lọc đơn chờ xác nhận"
                >
                    <div className="stat-inner">
                        <div className="stat-info">
                            <span className="stat-label">CHỜ XÁC NHẬN</span>
                            <span className="stat-value">{stats.preparing}</span>
                            <span className="stat-sublabel"> Cần xử lý ngay</span>
                        </div>
                        <div className="stat-icon-box">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className={`stat-card green tet-stat-card ${filters.orderStatus === '4' ? 'active-stat' : ''}`}
                    onClick={() => handleTabChange('4')}
                    title="Click để lọc đơn hoàn thành"
                >
                    <div className="stat-inner">
                        <div className="stat-info">
                            <span className="stat-label">HOÀN THÀNH</span>
                            <span className="stat-value">{stats.completed}</span>
                            <span className="stat-sublabel">🎉 Khai xuân phát tài</span>
                        </div>
                        <div className="stat-icon-box">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                <div
                    className={`stat-card red tet-stat-card ${filters.orderStatus === '5' ? 'active-stat' : ''}`}
                    onClick={() => handleTabChange('5')}
                    title="Click để lọc đơn đã hủy"
                >
                    <div className="stat-inner">
                        <div className="stat-info">
                            <span className="stat-label">ĐÃ HỦY</span>
                            <span className="stat-value">{stats.cancelled}</span>
                            <span className="stat-sublabel">❌ Đơn hủy bỏ</span>
                        </div>
                        <div className="stat-icon-box">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD CONTENT AREA */}
            <div className="dashboard-content-card">

                {/* BỐ CỤC 2: THANH LỌC NHANH DẠNG TAB (QUICK STATUS TABS) */}
                <div className="status-tabs-container">
                    <div className="tabs-list">
                        {statusTabs.map(tab => {
                            const isActive = filters.orderStatus === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    className={`tab-item ${isActive ? 'tab-active' : ''}`}
                                    onClick={() => handleTabChange(tab.key)}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== null && tab.count > 0 && (
                                        <span className="tab-badge">{tab.count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* BỐ CỤC 3: TOOLBAR (SEARCH BAR & ADVANCED FILTER TOGGLE) */}
                <div className="table-toolbar">
                    <div className="search-bar-wrapper">
                        <Search size={16} className="search-input-icon" />
                        <input
                            name="orderCode"
                            value={filters.orderCode}
                            className="toolbar-search-input"
                            placeholder="Tìm kiếm mã đơn ORD..., tên khách hàng..."
                            onChange={handleFilterChange}
                        />
                        {filters.orderCode && (
                            <button className="toolbar-clear-btn" onClick={() => setFilters(prev => ({ ...prev, orderCode: '' }))}>×</button>
                        )}
                    </div>

                    <div className="toolbar-actions-group">
                        <select
                            name="paymentMethod"
                            value={filters.paymentMethod}
                            className="toolbar-select"
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả phương thức TT</option>
                            {Object.entries(PAYMENT_METHOD_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>

                        <button
                            className={`btn-toggle-advanced ${showAdvancedFilter ? 'active' : ''}`}
                            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                            title="Lọc theo ngày"
                        >
                            <SlidersHorizontal size={16} />
                            <span>{showAdvancedFilter ? "Ẩn lọc ngày" : "Lọc theo ngày"}</span>
                        </button>

                        <button className="btn-refresh-orders toolbar-btn-refresh" onClick={fetchOrders} title="Làm mới dữ liệu">
                            <RefreshCw size={15} className={loading ? "spin-animation" : ""} />
                            <span>Cập nhật</span>
                        </button>

                        <div className="signalr-live-pill toolbar-signalr" title="Kết nối SignalR Realtime">
                            <span className="pulse-green-dot"></span>
                            <span>Live</span>
                        </div>

                        {(filters.orderCode || filters.orderStatus || filters.paymentMethod || filters.fromDate || filters.toDate) && (
                            <button className="btn-reset-toolbar" onClick={handleResetFilters}>
                                <span>Đặt lại</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ADVANCED DATE FILTER COLLAPSIBLE PANEL */}
                {showAdvancedFilter && (
                    <div className="advanced-filter-panel">
                        <div className="date-filter-group">
                            <label>Từ ngày:</label>
                            <input type="date" name="fromDate" value={filters.fromDate} className="date-input" onChange={handleFilterChange} />
                        </div>
                        <div className="date-filter-group">
                            <label>Đến ngày:</label>
                            <input type="date" name="toDate" value={filters.toDate} className="date-input" onChange={handleFilterChange} />
                        </div>
                        <button className="btn-apply-date" onClick={fetchOrders}>
                            <Search size={15} /><span>Áp dụng lọc</span>
                        </button>
                    </div>
                )}

                {/* BỐ CỤC 4: BẢNG DỮ LIỆU ĐƠN HÀNG (ORDER TABLE) */}
                <div className="responsive-table-wrapper">
                    <table className="custom-table tet-table">
                        <thead>
                            <tr>
                                <th>MÃ ĐƠN</th>
                                <th>KHÁCH HÀNG & THỜI GIAN</th>
                                <th>PHƯƠNG THỨC</th>
                                <th>THANH TOÁN</th>
                                <th>TRẠNG THÁI XỬ LÝ</th>
                                <th>TỔNG TIỀN</th>
                                <th className="text-right">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="loading-state">
                                        <div className="loading-flex">
                                            <RefreshCw size={20} className="spin-animation" />
                                            <span>Đang tải dữ liệu đơn hàng Tết...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="loading-state empty-state">
                                        <span>🧧 Không tìm thấy đơn hàng phù hợp với bộ lọc.</span>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.idOrder}
                                        className={`clickable-row ${order.isNew ? "row-flashing" : ""}`}
                                        onClick={() => handleRowClick(order.idOrder)}
                                    >
                                        <td className="order-code-cell">
                                            <span className="order-code-text">#{order.orderCode}</span>
                                            {order.isNew && <span className="new-order-badge">MỚI!</span>}
                                        </td>
                                        <td>
                                            <div className="cust-cell">
                                                <span className="cust-name">{order.nameCustomer || "Khách Vãng Lai"}</span>
                                                <span className="cust-date">
                                                    📅 {new Date(order.createAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="method-tag tet-method-tag">
                                                {PAYMENT_METHOD_MAP[order.paymentMethod] || 'Chưa xác định'}
                                            </span>
                                        </td>
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
                                                {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
                                                    <option key={k} value={k}>{v.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="total-amount-cell">
                                            {order.totalAmount?.toLocaleString()}đ
                                        </td>
                                        <td className="text-right">
                                            <button className="action-view tet-btn-action" onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(order.idOrder);
                                            }}>
                                                <Eye size={15} /><span>Chi tiết</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="pagination tet-pagination">
                    <p className="page-text">
                        Đang hiển thị <b>{orders.length}</b> đơn hàng • Trang <span className="page-number-highlight">{filters.currentPage}</span>
                    </p>
                    <div className="page-btns">
                        <button
                            disabled={filters.currentPage === 1}
                            onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, currentPage: filters.currentPage - 1 }) }}
                            title="Trang trước"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFilters({ ...filters, currentPage: filters.currentPage + 1 }) }}
                            title="Trang tiếp"
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

