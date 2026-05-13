import React, { useState } from 'react';
import { UserPlus, Loader2, CheckCircle, Sparkles, Star } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        UserName: '',
        Email: '',
        Password: '',
        ConfirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.Password !== formData.ConfirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);

        try {

            const apiUrl = import.meta.env.VITE_API_URL;

            const response = await axios.post(`${apiUrl}/auth/signup`, formData);
            console.log("Đăng ký thành công:", response.data);
            setSuccess(true);
            
            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (err) {
            setError(err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-wrapper">
            {/* Cành đào trang trí góc Card */}
            <div className="signup-card-custom shadow-lg">
                
                {/* Thành phần trang trí */}
                <img 
                    src="https://png.pngtree.com/png-vector/20221221/ourmid/pngtree-peach-blossom-flower-vietnamese-new-year-decoration-png-image_6531371.png" 
                    className="tet-decoration dao-branch" 
                    alt="Hoa Đào"
                />
                <img 
                    src="https://png.pngtree.com/png-vector/20230105/ourmid/pngtree-apricot-blossom-tet-holiday-vietnam-flower-png-image_6552361.png" 
                    className="tet-decoration mai-branch" 
                    alt="Hoa Mai"
                />
                <div className="firework-sparkle">
                    <Sparkles size={30} />
                </div>

                {/* Cột trái: Ảnh truyền thống */}
                <div className="signup-image-section d-none d-md-block">
                    <img 
                        src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80" 
                        alt="Tet Vietnam" 
                    />
                    <div className="image-overlay-text">
                        <h2>Chúc Mừng Năm Mới</h2>
                        <p>Đăng ký thành viên - Nhận lì xì đầu xuân 🧧</p>
                    </div>
                </div>

                {/* Cột phải: Form */}
                <div className="signup-form-section">
                    <div className="mb-4 text-center">
                        <h1 className="text-tet-red m-0">Khai Xuân Đăng Ký</h1>
                        <p className="text-muted small">Vạn sự như ý - Ăn uống hết ý</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                    {success && (
                        <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
                            <CheckCircle size={18} /> Đăng ký thành công! Đang chuyển hướng hái lộc...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <label className="small fw-bold mb-1">Tên gia chủ (Username)</label>
                            <input 
                                type="text" 
                                name="UserName"
                                className="custom-input" 
                                placeholder="Nhập tên của bạn"
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="mb-2">
                            <label className="small fw-bold mb-1">Địa chỉ Email</label>
                            <input 
                                type="email" 
                                name="Email"
                                className="custom-input" 
                                placeholder="ten@vidu.com"
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="mb-2">
                            <label className="small fw-bold mb-1">Mật khẩu</label>
                            <input 
                                type="password" 
                                name="Password"
                                className="custom-input" 
                                placeholder="••••••••"
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="mb-4">
                            <label className="small fw-bold mb-1">Xác nhận mật khẩu</label>
                            <input 
                                type="password" 
                                name="ConfirmPassword"
                                className="custom-input" 
                                placeholder="••••••••"
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-tet" disabled={loading || success}>
                            {loading ? (
                                <Loader2 className="spinner" />
                            ) : (
                                <>
                                    <Star size={20} fill="currentColor" /> 
                                    NHẬN LÌ XÌ & ĐĂNG KÝ
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <small className="text-muted">
                            Đã có tài khoản? <Link to="/login" className="text-tet-red fw-bold text-decoration-none">Đăng nhập hái lộc</Link>
                        </small>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;