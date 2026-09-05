import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Home } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import longdentetImg from '../../assets/longdentet.png';
import hoadaotraiImg from '../../assets/hoadaotrai.webp';
import tetdoanvienImg from '../../assets/tetdoanvien.webp';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });

    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        setToast({
            show: true,
            message: 'Tính năng này đang trong quá trình phát triển, vui lòng thử lại sau!'
        });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 3200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";

            const response = await axios.post(`${apiUrl}/auth/login`, {
                Email: email,
                Password: password
            });

            const data = response.data;
            const token = data.accessToken?.tokenValue || data.accessToken || data.token;

            if (data.isLoginSuccessful || token) {
                let userRole = 'User';
                if (token) {
                    try {
                        const decoded = jwtDecode(token);
                        console.log("Dữ liệu trong Token:", decoded);
                        userRole = decoded["role"]
                            || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                            || 'User';
                    } catch (decErr) {
                        console.error("Lỗi giải mã token:", decErr);
                    }
                }

                // Lưu thông tin vào LocalStorage
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userId", data.id || data.userId || "");
                localStorage.setItem("userName", data.email || email);
                localStorage.setItem("userRole", userRole);
                if (token) localStorage.setItem("accessToken", token);
                if (data.refreshToken?.tokenValue) {
                    localStorage.setItem("refreshToken", data.refreshToken.tokenValue);
                }
                if (data.idSession) {
                    localStorage.setItem("sessionId", data.idSession);
                }

                // Bắn event thông báo ứng dụng đã đăng nhập
                window.dispatchEvent(new Event('authChanged'));

                if (userRole === 'Admin' || userRole === 'Staff') {
                    navigate('/management/dashboard');
                } else {
                    navigate('/home');
                }
            } else {
                setError(data.message || "Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.");
            }
        } catch (err) {
            console.error("Lỗi Đăng Nhập:", err);
            setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper tet-theme">
            {/* HIỆU ỨNG THÔNG BÁO TOAST TẾT */}
            <div className={`login-toast-notification ${toast.show ? 'show' : ''}`}>
                <span className="toast-icon">🏮</span>
                <span className="toast-text">{toast.message}</span>
            </div>

            {/* Nút Trở về trang chủ */}
            <Link to="/home" className="btn-back-home">
                <Home size={18} />
                <span>Trở về trang chủ</span>
            </Link>

            {/* Lồng đèn góc phải trên màn hình */}
            <img src={longdentetImg} alt="Lồng đèn Tết" className="top-right-longden-img" />

            <div className="login-card-custom shadow-lg">

                <div className="login-image-section d-none d-md-block">
                    <img src={tetdoanvienImg} alt="Tết Đoàn Viên" />
                    <div className="image-overlay">
                        <h3>FOODLY - TẾT ĐOÀN VIÊN</h3>
                        <p>Khai xuân như ý, lì xì đầy tay!</p>
                    </div>
                </div>

                <div className="login-form-section">
                    <div className="text-center">
                        <h1 className="login-logo">FOODLY.</h1>
                        <p className="tet-greeting">
                            <img src={hoadaotraiImg} alt="Hoa đào" className="greeting-hoadaotrai-icon" />
                            <span>CHÚC MỪNG NĂM MỚI</span>
                            <img src={hoadaotraiImg} alt="Hoa đào" className="greeting-hoadaotrai-icon flipped" />
                        </p>
                    </div>

                    {error && <div className="alert alert-danger p-2 small text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="mb-3">
                            <label className="small fw-bold mb-1 text-danger">Email</label>
                            <input
                                type="email"
                                className="custom-input w-100"
                                placeholder="ducdepzai102@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="small fw-bold mb-1 text-danger">Mật khẩu</label>
                            <input
                                type="password"
                                className="custom-input w-100"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-foodly" disabled={loading}>
                            {loading ? <Loader2 className="spinner animate-spin" /> : <>KHAI XUÂN NGAY <ArrowRight size={20} /></>}
                        </button>

                        <div className="divider-container">
                            <span className="divider-line"></span>
                            <span className="divider-text">Hoặc</span>
                            <span className="divider-line"></span>
                        </div>

                        <button
                            type="button"
                            className="btn-google-login"
                            onClick={handleGoogleLogin}
                        >
                            <FcGoogle size={22} />
                            <span>Đăng nhập bằng Google</span>
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <small className="text-muted">Chưa có tài khoản? <Link to="/signup" className="signup-link fw-bold">Đăng ký tài khoản mới</Link></small>
                    </div>
                </div>
            </div>
            <img src={hoadaotraiImg} alt="Hoa đào góc dưới" className="hoadaotrai-bottom-img" />
        </div>
    );
};

export default Login;