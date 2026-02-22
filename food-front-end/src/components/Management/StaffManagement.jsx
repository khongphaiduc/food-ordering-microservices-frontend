import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './StaffManagement.css';

const StaffManagement = () => {
    const navigate = useNavigate(); // Sử dụng hook để điều hướng
    const [staffs, setStaffs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        Password: '',
        IdRole: ''
    });

    const API_STAFF = 'https://localhost:7150/auth/admin/staff';
    const API_ROLES = 'https://localhost:7150/auth/admin/roles';

    // Cấu hình Header chứa Token
    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        return { 
            headers: { 
                Authorization: `Bearer ${token}` 
            } 
        };
    };

    // Cấu hình Toast cho các thông báo nhẹ
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
            
            setStaffs(staffRes.data);
            setRoles(roleRes.data);
            
            if (roleRes.data.length > 0) {
                setFormData(prev => ({ ...prev, IdRole: roleRes.data[0].idRole }));
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            
            // Xử lý thông báo KHÔNG CHO PHÉP TẮT khi thiếu quyền (401 hoặc 403)
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Truy cập bị từ chối',
                    text: 'Bạn chưa được phân quyền cho tính năng này!',
                    allowOutsideClick: false, // Không cho phép đóng khi click ra ngoài
                    allowEscapeKey: false,    // Không cho phép đóng bằng phím Esc
                    showConfirmButton: true,
                    confirmButtonText: 'Quay lại trang chủ',
                    confirmButtonColor: '#ff4757',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/management/dashboard'); // Điều hướng về trang chủ
                    }
                });
            } else {
                Toast.fire({ 
                    icon: 'error', 
                    title: 'Không thể tải dữ liệu nhân sự' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Đang xử lý...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        try {
            await axios.post(API_STAFF, formData, getAuthHeader());
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Tài khoản nhân viên mới đã sẵn sàng.',
                confirmButtonColor: '#ff4757',
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
                title: 'Lỗi hệ thống',
                text: error.response?.data?.message || 'Không thể tạo tài khoản nhân viên.',
                confirmButtonColor: '#ff4757'
            });
        }
    };

    return (
        <div className="staff-container">
            <div className="staff-header">
                <div className="title-group">
                    <h2>Đội ngũ nhân sự</h2>
                    <p>Quản lý quyền truy cập của đầu bếp và shipper</p>
                </div>
                <button className="btn-add-food-style" onClick={() => setIsModalOpen(true)}>
                    + Thêm thành viên
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Đang xác thực thông tin...</div>
            ) : (
                <div className="staff-grid">
                    {staffs.map((s) => (
                        <div key={s.idStaff} className="staff-card">
                            <div className="avatar-wrapper">
                                {s.role.some(r => r.includes('Shipper')) ? '🛵' : '👨‍🍳'}
                            </div>
                            <div className="staff-info">
                                <h3>{s.name}</h3>
                                <p className="staff-email">{s.email}</p>
                                <div className="roles-list">
                                    {s.role.map(r => (
                                        <span key={r} className={`role-tag role-${r.toLowerCase()}`}>
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="food-modal-content">
                        <div className="modal-header">
                            <h3>Đăng ký nhân viên</h3>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-item">
                                <label className="label-small">Họ và Tên</label>
                                <input 
                                    className="food-input" type="text" required 
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    value={formData.Name}
                                    onChange={e => setFormData({...formData, Name: e.target.value})}
                                />
                            </div>

                            <div className="form-item">
                                <label className="label-small">Email đăng nhập</label>
                                <input 
                                    className="food-input" type="email" required 
                                    placeholder="admin@restaurant.com"
                                    value={formData.Email}
                                    onChange={e => setFormData({...formData, Email: e.target.value})}
                                />
                            </div>

                            <div className="form-item">
                                <label className="label-small">Mật khẩu khởi tạo</label>
                                <input 
                                    className="food-input" type="password" required 
                                    placeholder="••••••••"
                                    value={formData.Password}
                                    onChange={e => setFormData({...formData, Password: e.target.value})}
                                />
                            </div>

                            <div className="form-item">
                                <label className="label-small">Vị trí công việc</label>
                                <select 
                                    className="food-input"
                                    value={formData.IdRole}
                                    onChange={e => setFormData({...formData, IdRole: e.target.value})}
                                >
                                    {roles.map(r => (
                                        <option key={r.idRole} value={r.idRole}>{r.roleName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Đóng</button>
                                <button type="submit" className="btn-submit-active">Kích hoạt</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;