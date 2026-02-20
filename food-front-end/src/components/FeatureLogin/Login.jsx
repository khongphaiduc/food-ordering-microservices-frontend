import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Thư viện giải mã token
import axios from 'axios';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [envelopes, setEnvelopes] = useState([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        const items = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 8,
            duration: 6 + Math.random() * 6,
            size: 1.5 + Math.random() * 2
        }));
        setEnvelopes(items);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('https://localhost:7150/auth/login', {
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

         
                if (userRole === 'Admin') {
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
            <div className="li-xi-container">
                {envelopes.map(env => (
                    <div key={env.id} className="li-xi" 
                        style={{ 
                            left: `${env.left}%`, 
                            animationDelay: `${env.delay}s`,
                            animationDuration: `${env.duration}s`,
                            fontSize: `${env.size}rem`
                        }}>🧧</div>
                ))}
            </div>

            <div className="login-card-custom shadow-lg">
                <div className="cherry-blossom-top">🌸</div>
                
                <div className="login-image-section d-none d-md-block">
                    <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80" alt="Tet Holiday" />
                    <div className="image-overlay">
                        <h3>FOODLY - TẾT ĐOÀN VIÊN</h3>
                        <p>Khai xuân như ý, lì xì đầy tay!</p>
                    </div>
                </div>

                <div className="login-form-section">
                    <div className="text-center">
                        <h1 className="login-logo">FOODLY.</h1>
                        <p className="tet-greeting">🏮 CHÚC MỪNG NĂM MỚI 🏮</p>
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
            <div className="lantern-bottom">🏮</div>
        </div>
    );
};

export default Login;