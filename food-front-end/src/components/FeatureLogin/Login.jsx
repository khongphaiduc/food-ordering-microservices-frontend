import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [envelopes, setEnvelopes] = useState([]);

    // Tạo hiệu ứng bao lì xì rơi khi component mount
    useEffect(() => {
        const items = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // Vị trí ngang ngẫu nhiên
            delay: Math.random() * 8,   // Delay để không rơi cùng lúc
            duration: 6 + Math.random() * 6, // Tốc độ rơi khác nhau
            size: 1.5 + Math.random() * 2 // Kích thước to nhỏ khác nhau
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
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userName", data.email);
                localStorage.setItem("accessToken", data.accessToken.tokenValue);
                localStorage.setItem("refreshToken", data.refreshToken.tokenValue);

                window.location.href = '/home';
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
            {/* Hiệu ứng Lì xì rơi */}
            <div className="li-xi-container">
                {envelopes.map(env => (
                    <div 
                        key={env.id} 
                        className="li-xi" 
                        style={{ 
                            left: `${env.left}%`, 
                            animationDelay: `${env.delay}s`,
                            animationDuration: `${env.duration}s`,
                            fontSize: `${env.size}rem`
                        }}
                    >
                        🧧
                    </div>
                ))}
            </div>

            <div className="login-card-custom shadow-lg">
                {/* Góc trang trí hoa đào */}
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
                            <div className="input-group-custom">
                                <input 
                                    type="email" 
                                    className="custom-input" 
                                    placeholder="name@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="small fw-bold mb-1 text-danger">Mật khẩu</label>
                            <div className="input-group-custom">
                                <input 
                                    type="password" 
                                    className="custom-input" 
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-foodly" disabled={loading}>
                            {loading ? <Loader2 className="spinner" /> : <>KHAI XUÂN NGAY <ArrowRight size={20} /></>}
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <small className="text-muted">Chưa có tài khoản? <a href="/signup" className="signup-link">Đăng ký hái lộc</a></small>
                    </div>
                </div>
            </div>
            
            {/* Đèn lồng trang trí dưới góc */}
            <div className="lantern-bottom">🏮</div>
        </div>
    );
};

export default Login;