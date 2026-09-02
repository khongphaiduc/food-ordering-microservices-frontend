import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    Users, UserPlus, Search, ShieldCheck, 
    Mail, Lock, User, RefreshCw, LayoutGrid, 
    Table as TableIcon, ChefHat, Bike, ShieldAlert, Sparkles
} from 'lucide-react';
import './StaffManagement.css';

const StaffManagement = () => {
    const navigate = useNavigate();
    const [staffs, setStaffs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [viewMode, setViewMode] = useState('table'); // Mặc định hiển thị dạng Bảng Danh Sách

    const apiUrl = import.meta.env.VITE_API_URL;
    const API_STAFF = `${apiUrl}/auth/admin/staff`;
    const API_ROLES = `${apiUrl}/auth/admin/roles`;


    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        Password: '',
        IdRole: ''
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [staffRes, roleRes] = await Promise.all([
                axios.get(API_STAFF, getAuthHeader()),
                axios.get(API_ROLES, getAuthHeader())
            ]);
            
            setStaffs(staffRes.data || []);
            setRoles(roleRes.data || []);
            
            if (roleRes.data && roleRes.data.length > 0) {
                setFormData(prev => ({ ...prev, IdRole: roleRes.data[0].idRole }));
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Truy cập bị từ chối',
                    text: 'Bạn chưa được phân quyền cho tính năng quản lý nhân sự!',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: true,
                    confirmButtonText: 'Quay lại Bảng Điều Hành',
                    confirmButtonColor: '#dc2626',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/management/orders');
                    }
                });
            } else {
                Toast.fire({ icon: 'error', title: 'Không thể tải dữ liệu nhân sự' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Đang khởi tạo tài khoản...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        try {
            await axios.post(API_STAFF, formData, getAuthHeader());
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Tài khoản nhân viên mới đã được kích hoạt.',
                confirmButtonColor: '#dc2626',
                timer: 2000
            });

            setIsModalOpen(false);
            setFormData({ 
                Name: '', 
                Email: '', 
                Password: '', 
                IdRole: roles[0]?.idRole || '' 
            });
            loadInitialData(); 
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi khởi tạo',
                text: error.response?.data?.message || 'Không thể tạo tài khoản nhân viên.',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    // Lọc danh sách nhân viên theo từ khóa tìm kiếm & Vai trò
    const filteredStaffs = useMemo(() => {
        return staffs.filter(s => {
            const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  s.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === '' || s.role?.some(r => r.toLowerCase().includes(roleFilter.toLowerCase()));
            return matchesSearch && matchesRole;
        });
    }, [staffs, searchTerm, roleFilter]);

    // Thống kê nhanh số lượng theo vai trò
    const staffStats = useMemo(() => {
        const total = staffs.length;
        const shippers = staffs.filter(s => s.role?.some(r => r.toLowerCase().includes('shipper'))).length;
        const chefs = staffs.filter(s => s.role?.some(r => r.toLowerCase().includes('staff') || r.toLowerCase().includes('chef'))).length;
        const admins = total - shippers - chefs;
        return { total, shippers, chefs, admins };
    }, [staffs]);

    return (
        <div className="staff-container tet-staff-theme">
            {/* HEADER PAGE SECTION */}
            <div className="staff-page-header">
                <div className="header-title-box">
                    <div className="header-icon-badge">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2>Quản Lý Đội Ngũ Nhân Sự</h2>
                        <p>Điều hành danh sách phân quyền Đầu Bếp, Shipper và Nhân viên hệ thống</p>
                    </div>
                </div>

                <div className="header-action-group">
                    <button className="btn-refresh-staff" onClick={loadInitialData} title="Tải lại danh sách">
                        <RefreshCw size={16} className={loading ? "spin-animation" : ""} />
                        <span>Cập nhật</span>
                    </button>
                    <button className="btn-add-staff-main" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} />
                        <span>Thêm thành viên</span>
                    </button>
                </div>
            </div>

            {/* KPI STATS OVERVIEW CARDS */}
            <div className="staff-stats-grid">
                <div className="staff-kpi-card total">
                    <div className="kpi-info">
                        <span className="kpi-label">TỔNG NHÂN SỰ</span>
                        <span className="kpi-value">{staffStats.total}</span>
                        <span className="kpi-sub font-semibold">Tài khoản hoạt động</span>
                    </div>
                    <div className="kpi-icon-box blue">
                        <Users size={22} />
                    </div>
                </div>

                <div className="staff-kpi-card chefs">
                    <div className="kpi-info">
                        <span className="kpi-label">ĐẦU BẾP & PHỤC VỤ</span>
                        <span className="kpi-value">{staffStats.chefs}</span>
                        <span className="kpi-sub">👨‍🍳 Đội ngũ bếp chính</span>
                    </div>
                    <div className="kpi-icon-box orange">
                        <ChefHat size={22} />
                    </div>
                </div>

                <div className="staff-kpi-card shippers">
                    <div className="kpi-info">
                        <span className="kpi-label">ĐỘI NGŨ SHIPPER</span>
                        <span className="kpi-value">{staffStats.shippers}</span>
                        <span className="kpi-sub">🛵 Giao hàng nhanh</span>
                    </div>
                    <div className="kpi-icon-box green">
                        <Bike size={22} />
                    </div>
                </div>

                <div className="staff-kpi-card roles">
                    <div className="kpi-info">
                        <span className="kpi-label">VỊ TRÍ HỆ THỐNG</span>
                        <span className="kpi-value">{roles.length}</span>
                        <span className="kpi-sub">🛡️ Quyền hạn truy cập</span>
                    </div>
                    <div className="kpi-icon-box red">
                        <ShieldCheck size={22} />
                    </div>
                </div>
            </div>

            {/* TOOLBAR SEARCH & FILTERS */}
            <div className="staff-toolbar">
                <div className="search-box">
                    <Search size={16} className="search-icon-input" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên nhân viên, email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="staff-search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                    )}
                </div>

                <div className="filter-controls">
                    <select 
                        className="role-filter-select"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="">Tất cả vị trí công việc</option>
                        <option value="staff">Đầu bếp / Nhân viên</option>
                        <option value="shipper">Giao hàng Shipper</option>
                        <option value="admin">Quản trị Admin</option>
                    </select>

                    <div className="view-mode-toggle">
                        <button 
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Hiển thị dạng Thẻ"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Hiển thị dạng Bảng"
                        >
                            <TableIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN STAFF CONTENT DISPLAY */}
            {loading ? (
                <div className="loading-state-card">
                    <RefreshCw size={24} className="spin-animation text-red" />
                    <span>Đang tải thông tin đội ngũ nhân sự...</span>
                </div>
            ) : filteredStaffs.length === 0 ? (
                <div className="empty-staff-card">
                    <Users size={40} className="empty-icon" />
                    <h3>Không tìm thấy nhân viên phù hợp</h3>
                    <p>Thử thay đổi từ khóa tìm kiếm hoặc chọn lọc vị trí công việc khác.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* GRID CARD VIEW */
                <div className="staff-grid-wrapper">
                    {filteredStaffs.map((s) => {
                        const isShipper = s.role?.some(r => r.toLowerCase().includes('shipper'));
                        const isChef = s.role?.some(r => r.toLowerCase().includes('staff') || r.toLowerCase().includes('chef'));
                        
                        return (
                            <div key={s.idStaff} className="staff-member-card">
                                <div className="card-top-accent"></div>
                                <div className="avatar-section">
                                    <div className={`staff-avatar ${isShipper ? 'avatar-shipper' : 'avatar-chef'}`}>
                                        {isShipper ? '🛵' : isChef ? '👨‍🍳' : '🛡️'}
                                    </div>
                                    <span className="online-dot" title="Tài khoản hoạt động"></span>
                                </div>

                                <div className="staff-details">
                                    <h3 className="staff-name">{s.name}</h3>
                                    <span className="staff-email-text">{s.email}</span>

                                    <div className="staff-roles-container">
                                        {s.role.map(r => (
                                            <span key={r} className={`role-badge-pill role-${r.toLowerCase()}`}>
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* TABLE VIEW WITH AVATAR COLUMN */
                <div className="staff-table-container">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th className="text-center" style={{ width: '60px' }}>STT</th>
                                <th className="text-center" style={{ width: '90px' }}>AVATAR</th>
                                <th>HỌ VÀ TÊN</th>
                                <th>EMAIL ĐĂNG NHẬP</th>
                                <th>VỊ TRÍ / VAI TRÒ</th>
                                <th>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaffs.map((s, index) => {
                                const isShipper = s.role?.some(r => r.toLowerCase().includes('shipper'));
                                const isChef = s.role?.some(r => r.toLowerCase().includes('staff') || r.toLowerCase().includes('chef'));
                                return (
                                    <tr key={s.idStaff}>
                                        <td className="text-center font-bold text-sub">{index + 1}</td>
                                        <td className="text-center">
                                            <div className="table-avatar-badge">
                                                <span className="avatar-emoji">{isShipper ? '🛵' : isChef ? '👨‍🍳' : '🛡️'}</span>
                                                <span className="table-online-dot"></span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="table-user-name">{s.name}</span>
                                        </td>
                                        <td className="table-email-cell">{s.email}</td>
                                        <td>
                                            <div className="staff-roles-container align-left">
                                                {s.role.map(r => (
                                                    <span key={r} className={`role-badge-pill role-${r.toLowerCase()}`}>
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-pill-active">
                                                <span className="small-green-dot"></span> Đang hoạt động
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL REGISTRATION STAFF */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="staff-modal-content">
                        <div className="modal-top-header">
                            <div className="modal-title-group">
                                <div className="modal-icon-badge">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h3>Tạo Tài Khoản Nhân Viên</h3>
                                    <p>Cấp quyền truy cập cho nhân viên mới vào hệ thống</p>
                                </div>
                            </div>
                            <button className="close-x-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form-body">
                            <div className="form-group-item">
                                <label><User size={15} /> Họ và Tên Nhân Viên</label>
                                <input 
                                    className="modal-form-input" 
                                    type="text" 
                                    required 
                                    placeholder="Ví dụ: Nguyễn Văn An"
                                    value={formData.Name}
                                    onChange={e => setFormData({...formData, Name: e.target.value})}
                                />
                            </div>

                            <div className="form-group-item">
                                <label><Mail size={15} /> Email Đăng Nhập</label>
                                <input 
                                    className="modal-form-input" 
                                    type="email" 
                                    required 
                                    placeholder="nhanvien@foodly.com"
                                    value={formData.Email}
                                    onChange={e => setFormData({...formData, Email: e.target.value})}
                                />
                            </div>

                            <div className="form-group-item">
                                <label><Lock size={15} /> Mật Khẩu Khởi Tạo</label>
                                <input 
                                    className="modal-form-input" 
                                    type="password" 
                                    required 
                                    placeholder="••••••••"
                                    value={formData.Password}
                                    onChange={e => setFormData({...formData, Password: e.target.value})}
                                />
                            </div>

                            <div className="form-group-item">
                                <label><ShieldCheck size={15} /> Vị Trí Công Việc (Vai Trò)</label>
                                <select 
                                    className="modal-form-input modal-select"
                                    value={formData.IdRole}
                                    onChange={e => setFormData({...formData, IdRole: e.target.value})}
                                >
                                    {roles.map(r => (
                                        <option key={r.idRole} value={r.idRole}>{r.roleName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-modal-submit">Kích hoạt tài khoản</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;