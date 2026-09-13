import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  Utensils,
  ChefHat,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  Copy,
  Check,
  Activity,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  X,
  Flame,
  Coffee,
  Package,
  Server,
  Zap
} from 'lucide-react';
import BrandLogo from '../homepage/BrandLogo';
import './Maintenance.css';

export default function Maintenance({ onRetry, apiUrl }) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);
  const [checkingPing, setCheckingPing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Hiển thị thông báo Toast ngắn
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sao chép mã giảm giá
  const handleCopyVoucher = () => {
    const code = "YUMMY10OFF";
    navigator.clipboard.writeText(code).then(() => {
      setCopiedVoucher(true);
      showToast("🎁 Đã sao chép mã YUMMY10OFF vào bộ nhớ tạm!");
      setTimeout(() => setCopiedVoucher(false), 3000);
    }).catch(() => {
      showToast("Mã giảm giá: YUMMY10OFF");
    });
  };

  // Thử lại kết nối
  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);

    try {
      if (onRetry && typeof onRetry === 'function') {
        await onRetry();
      } else if (apiUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${apiUrl}/products/ai`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          showToast("🟢 Đã khôi phục kết nối! Đang chuyển về trang chủ...");
          setTimeout(() => navigate('/home'), 1200);
          return;
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
      showToast("⚡ Căn bếp vẫn đang gấp rút hoàn thiện. Cảm ơn bạn đã kiên nhẫn!");
    } catch (err) {
      showToast("⚡ Hệ thống vẫn đang bảo trì. Vui lòng quay lại sau ít phút.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Kiểm tra độ trễ mạng (Ping)
  const handlePingCheck = async () => {
    setCheckingPing(true);
    const start = Date.now();
    try {
      const urlToPing = apiUrl || 'https://httpbin.org/get';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      await fetch(urlToPing, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;
      setPingLatency(`${elapsed} ms`);
    } catch (e) {
      setPingLatency('Đang cập nhật...');
    } finally {
      setCheckingPing(false);
    }
  };

  const handleBackHome = () => {
    if (onRetry) {
      handleRetry();
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="maintenance-root">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="maintenance-toast-banner" role="alert">
          <Sparkles className="toast-sparkle-icon" size={18} />
          <span>{toastMessage}</span>
          <button className="toast-close-btn" onClick={() => setToastMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Background Decorative Ambient Layers */}
      <div className="maintenance-bg-grid" />
      <div className="maintenance-glow-blob blob-top-left" />
      <div className="maintenance-glow-blob blob-bottom-right" />

      {/* Floating Background Ingredients & Culinary Elements */}
      <div className="floating-elements-container" aria-hidden="true">
        <div className="floating-item item-burger">🍔</div>
        <div className="floating-item item-ramen">🍜</div>
        <div className="floating-item item-pizza">🍕</div>
        <div className="floating-item item-boba">🧋</div>
        <div className="floating-item item-gear">⚙️</div>
        <div className="floating-item item-sparkle">✨</div>
        <div className="floating-item item-tomato">🍅</div>
        <div className="floating-item item-chili">🌶️</div>
      </div>

      {/* TOP HEADER */}
      <header className="maintenance-header">
        <div className="maintenance-header-brand">
          <Link to="/home" className="brand-logo-link" aria-label="Về trang chủ">
            <BrandLogo size="small" />
          </Link>
        </div>

        <div className="maintenance-status-pill" role="status">
          <span className="status-dot-pulse" />
          <span className="status-text-live">Đang bảo trì hệ thống</span>
        </div>
      </header>

      {/* MAIN HERO & CONTENT CONTAINER */}
      <main className="maintenance-hero-container">
        <div className="maintenance-hero-grid">
          {/* LEFT COLUMN: Maintenance Text & CTAs */}
          <div className="hero-text-col">
            <div className="maintenance-mode-badge">
              <Wrench size={14} className="badge-icon-wrench" />
              <span>CHẾ ĐỘ BẢO TRÌ BẾP</span>
            </div>

            <h1 className="hero-main-heading">
              Bếp đang chuẩn bị <span className="gradient-highlight">món mới ngon hơn</span>.
            </h1>

            <p className="hero-subheading">
              Căn bếp của chúng tôi tạm thời đóng cửa để nâng cấp hệ thống. Chúng tôi sẽ trở lại ngay với trải nghiệm nhanh hơn, tươi ngon hơn!
            </p>

            {/* Food-themed Microcopy Pills */}
            <div className="microcopy-pills-wrapper">
              <div className="microcopy-pill">
                <ChefHat size={15} className="pill-icon" />
                <span>Đợi chút nhé — gian bếp đang được tân trang cấp tốc.</span>
              </div>
              <div className="microcopy-pill">
                <Flame size={15} className="pill-icon flame" />
                <span>Món ăn nóng hổi sẽ tiếp tục phục vụ quý khách ngay thôi.</span>
              </div>
            </div>

            {/* CTA ACTION BUTTONS */}
            <div className="hero-cta-group">
              <button
                className={`btn-cta-primary ${isRetrying ? 'loading' : ''}`}
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCw size={17} className={`cta-icon ${isRetrying ? 'spin' : ''}`} />
                <span>{isRetrying ? 'Đang kiểm tra kết nối...' : 'Thử lại kết nối'}</span>
              </button>

              <button
                className="btn-cta-secondary"
                onClick={() => {
                  setShowStatusModal(true);
                  handlePingCheck();
                }}
              >
                <Activity size={17} className="cta-icon-activity" />
                <span>Kiểm tra trạng thái hệ thống</span>
              </button>

              <button className="btn-cta-ghost" onClick={handleBackHome}>
                <ArrowLeft size={15} />
                <span>Trở về Trang chủ</span>
              </button>
            </div>

            {/* Compensation Voucher Code Teaser Box */}
            <div className="voucher-compensation-box">
              <div className="voucher-info-left">
                <div className="voucher-gift-icon-wrapper">
                  <Gift size={18} className="gift-icon" />
                </div>
                <div>
                  <div className="voucher-title">Xin lỗi vì sự gián đoạn! Tặng bạn giảm 10%</div>
                  <div className="voucher-subtitle">Áp dụng cho đơn hàng tiếp theo khi bếp mở lại</div>
                </div>
              </div>

              <button
                className={`voucher-code-badge-btn ${copiedVoucher ? 'copied' : ''}`}
                onClick={handleCopyVoucher}
                title="Bấm để sao chép mã ưu đãi"
              >
                {copiedVoucher ? (
                  <>
                    <Check size={14} className="check-icon" />
                    <span>ĐÃ SAO CHÉP!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="copy-icon" />
                    <span className="code-text">YUMMY10OFF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Rich Animated Vector SVG Graphic */}
          <div className="hero-illustration-col" aria-label="Hình minh họa bếp bảo trì">
            <div className="illustration-wrapper">
              <div className="ambient-glow-circle" />

              <svg
                className="kitchen-svg-graphic"
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="goldDishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff3b0" />
                    <stop offset="30%" stopColor="#f59e0b" />
                    <stop offset="80%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#fff7ed" />
                  </linearGradient>

                  <linearGradient id="steamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>

                  <filter id="heroShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#d97706" floodOpacity="0.22" />
                  </filter>
                  <filter id="gearGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.35" />
                  </filter>
                </defs>

                {/* Vòng bánh răng quay background */}
                <g className="svg-rotating-gears" filter="url(#gearGlow)">
                  <circle cx="250" cy="250" r="190" stroke="#fde68a" strokeWidth="2" strokeDasharray="8 12" fill="none" opacity="0.6" />
                  <circle cx="250" cy="250" r="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 20" fill="none" opacity="0.4" />

                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = 250 + 190 * Math.cos(rad);
                    const y = 250 + 190 * Math.sin(rad);
                    return (
                      <circle key={index} cx={x} cy={y} r="6" fill="#f59e0b" opacity="0.5" />
                    );
                  })}
                </g>

                {/* Hơi nước bốc lên */}
                <g className="svg-steam-group">
                  <path d="M 220 170 Q 210 130 225 90 Q 240 50 225 20" stroke="url(#steamGrad)" strokeWidth="6" strokeLinecap="round" fill="none" className="steam-line steam-1" />
                  <path d="M 250 160 Q 265 120 250 80 Q 235 40 255 10" stroke="url(#steamGrad)" strokeWidth="8" strokeLinecap="round" fill="none" className="steam-line steam-2" />
                  <path d="M 280 170 Q 295 130 280 90 Q 265 50 285 20" stroke="url(#steamGrad)" strokeWidth="6" strokeLinecap="round" fill="none" className="steam-line steam-3" />
                </g>

                {/* Khay & Nắp đậy món ăn */}
                <ellipse cx="250" cy="390" rx="170" ry="30" fill="#fed7aa" opacity="0.4" filter="url(#heroShadow)" />
                <ellipse cx="250" cy="385" rx="140" ry="22" fill="#fde68a" opacity="0.7" />

                <g className="svg-cloche-group" filter="url(#heroShadow)">
                  <path d="M 120 360 C 120 380 380 380 380 360 L 390 350 C 390 340 110 340 110 350 Z" fill="url(#goldDishGrad)" />
                  <rect x="125" y="348" width="250" height="8" rx="4" fill="#ffffff" opacity="0.6" />
                  <path d="M 130 345 C 130 200 370 200 370 345 Z" fill="url(#boxGrad)" stroke="#f59e0b" strokeWidth="4" />
                  <path d="M 145 340 C 145 220 355 220 355 340 Z" fill="none" stroke="#fde68a" strokeWidth="2" opacity="0.6" />
                  <path d="M 160 320 C 170 240 220 220 240 215" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
                  <circle cx="250" cy="195" r="18" fill="url(#goldDishGrad)" />
                  <circle cx="250" cy="195" r="10" fill="#ffffff" opacity="0.4" />
                  <rect x="244" y="210" width="12" height="15" rx="3" fill="url(#goldDishGrad)" />

                  <g transform="translate(215, 255)">
                    <rect x="0" y="0" width="70" height="55" rx="14" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
                    <path d="M 23 40 L 47 16" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 47 40 L 23 16" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="35" cy="28" r="8" fill="#f59e0b" />
                    <circle cx="35" cy="28" r="4" fill="#ffffff" />
                  </g>
                </g>

                <g className="svg-floating-wrench-gear">
                  <circle cx="110" cy="230" r="22" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" filter="url(#heroShadow)" />
                  <path d="M 102 230 L 118 230 M 110 222 L 110 238" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
                </g>

                <g className="svg-floating-timer-badge">
                  <rect x="340" y="210" width="60" height="42" rx="12" fill="#ffffff" stroke="#10b981" strokeWidth="3" filter="url(#heroShadow)" />
                  <circle cx="360" cy="231" r="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                  <path d="M 360 227 V 231 H 364" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <text x="375" y="235" fill="#047857" fontSize="12" fontWeight="800" fontFamily="sans-serif">85%</text>
                </g>

                <path d="M 90 140 L 94 150 L 104 154 L 94 158 L 90 168 L 86 158 L 76 154 L 86 150 Z" fill="#f59e0b" className="sparkle-star star-1" />
                <path d="M 410 130 L 413 138 L 421 141 L 413 144 L 410 152 L 407 144 L 399 141 L 407 138 Z" fill="#fbbf24" className="sparkle-star star-2" />
              </svg>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: MAINTENANCE STATUS CARD */}
        <section className="maintenance-status-card-wrapper">
          <div className="status-card-header">
            <div className="header-title-block">
              <div className="status-live-tag">
                <span className="live-amber-dot" />
                <span>ĐANG XỬ LÝ</span>
              </div>
              <h2 className="status-card-title">Tiến Độ Nâng Cấp Gian Bếp</h2>
            </div>

            <div className="downtime-estimate-pill">
              <Clock size={14} className="clock-icon" />
              <span>Thời gian dự kiến: <strong>Ngắn (~15–30 phút)</strong></span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-meta">
              <span className="progress-status-text">Đang chuẩn bị mâm cỗ tiếp theo...</span>
              <span className="progress-percentage-text">85% Hoàn tất</span>
            </div>

            <div className="progress-track" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-fill" style={{ width: '85%' }}>
                <div className="progress-shimmer" />
              </div>
            </div>
          </div>

          {/* Live System Upgrade Steps */}
          <div className="upgrade-steps-grid">
            <div className="step-item step-completed">
              <div className="step-icon-box">
                <CheckCircle2 size={17} className="icon-completed" />
              </div>
              <div className="step-content">
                <div className="step-title">Cập Nhật Thực Đơn & Ưu Đãi</div>
                <div className="step-desc">Bổ sung nhiều món ngon hấp dẫn & mã giảm giá</div>
              </div>
            </div>

            <div className="step-item step-in-progress">
              <div className="step-icon-box">
                <RefreshCw size={17} className="icon-in-progress spin" />
              </div>
              <div className="step-content">
                <div className="step-title">Tăng Tốc Đặt Món & Giao Vận</div>
                <div className="step-desc">Tối ưu trải nghiệm đặt hàng & giao siêu tốc 15 phút</div>
              </div>
            </div>

            <div className="step-item step-pending">
              <div className="step-icon-box">
                <ShieldCheck size={17} className="icon-pending" />
              </div>
              <div className="step-content">
                <div className="step-title">Kiểm Định Chất Lượng Món Ăn</div>
                <div className="step-desc">Đảm bảo món giao tận tay luôn nóng hổi & chuẩn vị</div>
              </div>
            </div>
          </div>

          <div className="status-card-footer-note">
            <Coffee size={14} className="coffee-icon" />
            <span>Cảm ơn bạn đã kiên nhẫn trong khi chúng tôi chuẩn bị bếp nhé! ☕</span>
          </div>
        </section>
      </main>

      {/* SYSTEM STATUS DETAILED MODAL */}
      {showStatusModal && (
        <div className="status-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="status-modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="status-modal-header">
              <div className="modal-title-box">
                <Server size={19} className="modal-title-icon" />
                <h3>Trạng Thái Hoạt Động Của Bếp</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setShowStatusModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="status-modal-body">
              <div className="ping-test-box">
                <div className="ping-info">
                  <span className="ping-label">Tốc độ phản hồi mạng:</span>
                  <span className="ping-val">{checkingPing ? 'Đang kiểm tra...' : (pingLatency || '24 ms (Cực nhanh)')}</span>
                </div>
                <button className="btn-ping-retry" onClick={handlePingCheck} disabled={checkingPing}>
                  <RefreshCw size={13} className={checkingPing ? 'spin' : ''} />
                  <span>Kiểm tra Ping</span>
                </button>
              </div>

              <div className="services-health-list">
                <div className="service-row">
                  <div className="service-name">
                    <Zap size={15} className="service-icon" />
                    <span>Cổng Điều Hướng & Đặt Món</span>
                  </div>
                  <div className="service-status status-online">
                    <span className="dot" />
                    <span>Sẵn sàng</span>
                  </div>
                </div>

                <div className="service-row">
                  <div className="service-name">
                    <Utensils size={15} className="service-icon" />
                    <span>Thực Đơn Món Ngon & Khuyến Mãi</span>
                  </div>
                  <div className="service-status status-updating">
                    <span className="dot" />
                    <span>Đang cập nhật</span>
                  </div>
                </div>

                <div className="service-row">
                  <div className="service-name">
                    <Package size={15} className="service-icon" />
                    <span>Hệ Thống Giao Vận & Giỏ Hàng</span>
                  </div>
                  <div className="service-status status-updating">
                    <span className="dot" />
                    <span>Đang cập nhật</span>
                  </div>
                </div>

                <div className="service-row">
                  <div className="service-name">
                    <ShieldCheck size={15} className="service-icon" />
                    <span>Thanh Toán & Ưu Đãi Thành Viên</span>
                  </div>
                  <div className="service-status status-online">
                    <span className="dot" />
                    <span>Sẵn sàng</span>
                  </div>
                </div>
              </div>

              <div className="modal-notice-box">
                <AlertCircle size={15} className="notice-icon" />
                <span>Mọi thông tin tài khoản, đơn hàng và voucher của bạn luôn được bảo vệ an toàn 100%.</span>
              </div>
            </div>

            <div className="status-modal-footer">
              <button className="btn-modal-done" onClick={() => setShowStatusModal(false)}>
                Đóng bảng trạng thái
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="maintenance-footer">
        <p className="footer-copyright">
          © {new Date().getFullYear()} <strong>TRUNGDUCFOODLY</strong> — Nền Tảng Đặt Đồ Ăn Trực Tuyến Hàng Đầu.
        </p>
      </footer>
    </div>
  );
}
