import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Thư viện giải mã token
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
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
           const apiUrl = import.meta.env.VITE_API_URL;
        
         const response = await axios.post(`${apiUrl}/auth/login`, {
            Email: email,
            Password: password
        });

            const data = response.data;

            if (data.isLoginSuccessful) {
                const token = data.accessToken.tokenValue;
                
                // --- GIẢI MÃ TOKEN ĐỂ LẤY ROLE ---
                const decoded = jwtDecode(token);
                console.log("Dữ liệu trong Token:", decoded); // Xem cấu trúc token tại đây
                
                // Tùy vào Backend mà field này có thể là 'role' hoặc link dài của Microsoft
                const userRole = decoded["role"] || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                // Lưu vào LocalStorage
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userName", data.email);
                localStorage.setItem("userRole", userRole); 
                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", data.refreshToken.tokenValue);
                localStorage.setItem("sessionId", data.idSession);
         
                if (userRole === 'Admin' || userRole == "Staff") {
                    navigate('/management/dashboard');
                } else {
                    navigate('/home');
                }
            } else {
                setError(data.message || "Đăng nhập không thành công.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper tet-theme">
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
                                placeholder="name@example.com"
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
                    </form>
                    
                    <div className="text-center mt-4">
                        <small className="text-muted">Chưa có tài khoản? <a href="/signup" className="signup-link fw-bold">Đăng ký hái lộc</a></small>
                    </div>
                </div>
            </div>
            <img src={hoadaotraiImg} alt="Hoa đào góc dưới" className="hoadaotrai-bottom-img" />
        </div>
    );
};

export default Login;