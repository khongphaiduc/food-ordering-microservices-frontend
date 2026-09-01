import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Lock,
    ShieldCheck,
    Eye,
    EyeOff,
    Sparkles,
    Star,
    Loader2,
    Gift,
    Flame,
    ArrowRight,
    PartyPopper,
    CheckCircle2,
    Home
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import longdentetImg from '../../assets/longdentet.png';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import tetdoanvienImg from '../../assets/tetdoanvien.webp';
import iconloginhoaImg from '../../assets/iconloginhoa.png';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        UserName: '',
        Email: '',
        Password: '',
        ConfirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.Password !== formData.ConfirmPassword) {
            setError("Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
            return;
        }

        if (!formData.Password) {
            setError("Vui lòng nhập mật khẩu!");
            return;
        }

        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";
            const payload = {
                UserName: formData.UserName,
                username: formData.UserName,
                Email: formData.Email,
                emailAdress: formData.Email,
                emailAddress: formData.Email,
                EmailAddress: formData.Email,
                email: formData.Email,
                Password: formData.Password,
                password: formData.Password,
                ConfirmPassword: formData.ConfirmPassword,
                confirmPassword: formData.ConfirmPassword
            };

            const response = await axios.post(`${apiUrl}/auth/signup`, payload);
            const resData = response.data;

            if (resData?.status === true || resData?.status === "true") {
                console.log("Đăng ký thành công:", resData);
                setSuccess(true);

                setTimeout(() => {
                    navigate('/login');
                }, 2500);
            } else {
                setError(resData?.message || "Đăng ký thất bại, vui lòng thử lại.");
            }

        } catch (err) {
            console.error("Lỗi Đăng Ký:", err);
            const serverMsg = err.response?.data?.message || err.response?.data?.title || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(serverMsg || "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tet-signup-wrapper">
            {/* Nút Trở về trang chủ */}
            <Link to="/home" className="btn-back-home">
                <Home size={18} />
                <span>Trở về trang chủ</span>
            </Link>

            {/* Lồng đèn Tết góc phải màn hình */}
            <img
                src={longdentetImg}
                alt="Lồng đèn Tết"
                className="top-right-lantern"
            />

            {/* Cành hoa đào góc dưới trái */}
            <img
                src={hoadaotraiImg}
                alt="Cành hoa đào"
                className="bottom-left-peach-branch"
            />

            {/* Thẻ Đăng ký Tết */}
            <div className="tet-signup-card">
                {/* Băng rôn Tết trên cùng */}
                <div className="tet-top-ribbon">
                    <Sparkles size={14} className="sparkle-icon" />
                    <span>CHÚC MỪNG NĂM MỚI • KHAI XUÂN HÁI LỘC CÙNG FOODLY</span>
                    <Sparkles size={14} className="sparkle-icon" />
                </div>

                <div className="tet-signup-body">
                    {/* Cột Trái: Visual Tết */}
                    <div className="tet-visual-section">
                        <img
                            src={tetdoanvienImg}
                            alt="Tết Đoàn Viên Foodly"
                            className="visual-bg-image"
                        />
                        <div className="visual-gradient-overlay"></div>


                        {/* Nội dung Banner Trái */}
                        <div className="visual-content">
                            <div className="brand-header">
                                <h3 className="brand-title">FOODLY TẾT</h3>
                                <p className="brand-subtitle">Giao Hòa Hương Vị Tết Việt</p>
                            </div>

                            <div className="tet-story-box">
                                <p className="tet-story-text">
                                    Tết là những ngày ta trở về bên gia đình, cùng nhau quây quần bên mâm cơm ấm áp, thưởng thức những món ngon quen thuộc và trao nhau những lời chúc tốt lành. Dẫu năm tháng có đổi thay, hương vị ngày Tết vẫn luôn là ký ức thân thương gắn kết mỗi người với mái nhà và những người mình yêu thương.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Form Đăng Ký */}
                    <div className="tet-form-section">
                        <div className="form-header text-center">
                            <div className="logo-tag">
                                <img src={iconloginhoaImg} alt="Hoa" className="inline-flower" />
                                <span className="logo-text">FOODLY.</span>
                                <img src={iconloginhoaImg} alt="Hoa" className="inline-flower flipped" />
                            </div>
                            <h2 className="signup-title">KHAI XUÂN ĐĂNG KÝ</h2>
                            <p className="signup-subtitle">Vạn sự như ý - Ăn uống hết ý cùng gia đình</p>
                        </div>

                        {/* Thông báo Lỗi */}
                        {error && (
                            <div className="tet-alert tet-alert-error">
                                <Flame size={18} className="alert-icon" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Thông báo Thành Công */}
                        {success && (
                            <div className="tet-alert tet-alert-success">
                                <PartyPopper size={20} className="alert-icon pulse" />
                                <div>
                                    <strong>Đăng ký thành công! 🎉</strong>
                                    <p className="m-0 small">Đang chuyển sang trang Đăng Nhập hái lộc...</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="tet-form">
                            {/* Username Input */}
                            <div className="input-group-custom">
                                <label className="input-label">Tên của bạn</label>
                                <div className="input-wrapper">
                                    <User className="field-icon" size={18} />
                                    <input
                                        type="text"
                                        name="UserName"
                                        className="form-control-custom"
                                        placeholder="Ví dụ: Phạm Trung Đức"
                                        value={formData.UserName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="input-group-custom">
                                <label className="input-label">Địa chỉ Email</label>
                                <div className="input-wrapper">
                                    <Mail className="field-icon" size={18} />
                                    <input
                                        type="email"
                                        name="Email"
                                        className="form-control-custom"
                                        placeholder="ducdeptraivcl@example.com"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="input-group-custom">
                                <label className="input-label">Mật khẩu</label>
                                <div className="input-wrapper">
                                    <Lock className="field-icon" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="Password"
                                        className="form-control-custom pr-toggle"
                                        placeholder="Nhập mật khẩu của bạn"
                                        value={formData.Password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="input-group-custom">
                                <label className="input-label">Xác nhận mật khẩu</label>
                                <div className="input-wrapper">
                                    <ShieldCheck className="field-icon" size={18} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="ConfirmPassword"
                                        className={`form-control-custom pr-toggle ${formData.ConfirmPassword && formData.Password !== formData.ConfirmPassword ? 'input-error-border' : ''
                                            }`}
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.ConfirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.ConfirmPassword && (
                                    <div className="match-status-hint">
                                        {formData.Password === formData.ConfirmPassword ? (
                                            <span className="text-success small d-flex align-items-center gap-1 mt-1">
                                                <CheckCircle2 size={14} /> Mật khẩu trùng khớp
                                            </span>
                                        ) : (
                                            <span className="text-danger small mt-1 d-block">
                                                ⚠️ Mật khẩu chưa trùng khớp
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Nút Submit Đăng ký */}
                            <button
                                type="submit"
                                className="btn-tet-submit"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <div className="loading-content">
                                        <Loader2 className="spinner-icon" size={20} />
                                        <span>ĐANG HÁI LỘC & KHAI XUÂN...</span>
                                    </div>
                                ) : (
                                    <div className="btn-content">
                                        <Star size={18} className="star-sparkle fill-gold" />
                                        <span>NHẬN LÌ XÌ & KÍCH HOẠT TÀI KHOẢN</span>
                                        <ArrowRight size={18} className="arrow-icon" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Link Chuyển Sang Đăng Nhập */}
                        <div className="form-footer text-center">
                            <p className="footer-text">
                                Đã có tài khoản Tết?{' '}
                                <Link to="/login" className="login-gold-link">
                                    Đăng nhập đặt món liền tay <ArrowRight size={14} className="inline-arrow" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
