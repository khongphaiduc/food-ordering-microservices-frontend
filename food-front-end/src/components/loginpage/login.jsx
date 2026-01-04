import React, { useState, useRef, useContext } from "react";
import "./login.css";
import { LogInUser  ,LogInUserByGoogle} from "./loginservice";
import { AuthContext } from "../authentications/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// Icons SVG hiện đại (Thay cho emoji)
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const { loginfood, saveRefreshToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Giữ nguyên logic hiệu ứng di chuyển card ---
  const onMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    // Giảm góc xoay một chút để trông tinh tế hơn
    const rotateX = dy * 4;
    const rotateY = dx * -4;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    el.style.setProperty("--login-shine-x", `${(dx + 1) * 50}%`);
    el.style.setProperty("--login-shine-y", `${(dy + 1) * 50}%`);
  };

  const onMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--login-shine-x", `50%`);
    el.style.setProperty("--login-shine-y", `50%`);
  };

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email.trim() || !password) {
      setErr("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const res = await LogInUser(email, password);
      const accessToken = res.data.accessToken.token;
      const refreshToken = res.data.refreshToken.token;
      const userName = res.data.account;
      const idUser = res.data.id;

      loginfood(accessToken, userName, idUser);
      saveRefreshToken(refreshToken);
      navigate("/home");

    } catch (error) {
      if (error.response) {
        setErr(error.response.data.message || "Đăng nhập thất bại");
      } else {
        setErr("Không kết nối được server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Thêm lớp overlay để làm tối hình nền */}
      <div className="login-bg-overlay" aria-hidden="true" />
      <div className="login-bg" aria-hidden="true" />

      <main className="login-container">
        <div
          className="login-card"
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <div className="login-shine" />
          <header className="login-header">
            {/* Thêm chữ F cách điệu hoặc logo ảnh ở đây nếu có */}
            <div className="login-logo">PTD</div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-sub">Thưởng thức tinh hoa ẩm thực đẳng cấp</p>
          </header>

          <form className="login-form" onSubmit={validateAndSubmit} noValidate>
            <div className={`login-field ${email ? "filled" : ""}`}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="login-email">Email của bạn</label>
              <span className="login-field-icon"><MailIcon /></span>
            </div>

            <div className={`login-field ${password ? "filled" : ""}`}>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="login-password">Mật khẩu</label>
              <span className="login-field-icon"><LockIcon /></span>
            </div>

            {err && <div className="login-error">{err}</div>}

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" />
                <span>Ghi nhớ tôi</span>
              </label>
              <button type="button" className="login-link-forgot">Quên mật khẩu?</button>
            </div>

            <button type="submit" className={`login-submit ${loading ? "loading" : ""}`}>
              {loading ? "Đang xử lý..." : "ĐĂNG NHẬP NGAY"}
            </button>

            <div className="login-divider"><span>HOẶC TIẾP TỤC VỚI</span></div>

            <div className="login-socials">
              <a href="https://localhost:7150/users/googlelogin" type="button" className="login-social google">
                Google
              </a>
              <button type="button" className="login-social apple">
                 Apple
              </button>
            </div>
          </form>

          <footer className="login-footer">
            <p>
              Bạn chưa là thành viên?
              <button className="login-link-register">Đăng ký tài khoản mới</button>
            </p>
             <Link to="/home" className="login-back-link">← Quay lại Trang chủ</Link>
          </footer>
        </div>
      </main>
    </div>
  );
}