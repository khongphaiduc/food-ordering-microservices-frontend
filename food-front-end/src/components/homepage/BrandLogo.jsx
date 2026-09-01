import React from 'react';
import './brandlogo.css';

export default function BrandLogo({ size = "medium", light = false }) {
  return (
    <div className={`brand-logo-wrapper ${size} ${light ? 'light-theme' : ''}`}>
      <svg className="brand-logo-crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="25%" stopColor="#ffd700" />
            <stop offset="65%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8c610d" />
          </linearGradient>
          <linearGradient id="logoRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <filter id="logoCrestGlow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d4af37" floodOpacity="0.45"/>
          </filter>
        </defs>
        
        {/* Vòng Tròn Kim Tiền Hoàng Gia Outer Badge */}
        <circle cx="50" cy="50" r="44" stroke="url(#logoGoldGrad)" strokeWidth="3" fill="none" filter="url(#logoCrestGlow)" />
        <circle cx="50" cy="50" r="39" stroke="url(#logoGoldGrad)" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.8" />
        
        {/* Nắp Đĩa Ẩm Thực 5 Sao (Gourmet Cloche Arc) */}
        <path d="M 25 56 C 25 32 75 32 75 56 Z" fill="url(#logoGoldGrad)" opacity="0.15" />
        <path d="M 24 56 C 24 30 76 30 76 56 H 24 Z" stroke="url(#logoGoldGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* Vương Miện 5 Sao Ngôi Sao Đỉnh */}
        <path d="M 50 16 L 43 28 L 50 25 L 57 28 Z" fill="url(#logoGoldGrad)" />
        <circle cx="50" cy="13" r="3.2" fill="url(#logoGoldGrad)" />
        <circle cx="41" cy="18" r="2" fill="url(#logoGoldGrad)" />
        <circle cx="59" cy="18" r="2" fill="url(#logoGoldGrad)" />

        {/* Monogram TDF Viết Tắt Đẳng Cấp */}
        <text x="50" y="52" textAnchor="middle" fill="url(#logoGoldGrad)" fontSize="14" fontWeight="900" fontFamily="Playfair Display, Georgia, serif" letterSpacing="1.5">
          TDF
        </text>

        {/* Khay Dát Vàng Đế Đỡ */}
        <path d="M 18 60 H 82" stroke="url(#logoGoldGrad)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 30 65 H 70" stroke="url(#logoGoldGrad)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Hoa Đào Khai Xuân Điểm Nhấn */}
        <path d="M 50 71 C 45 77 50 83 50 83 C 50 83 55 77 50 71 Z" fill="url(#logoRedGrad)" />
        <path d="M 42 74 C 36 78 40 84 40 84 C 40 84 47 80 42 74 Z" fill="url(#logoRedGrad)" opacity="0.8" />
        <path d="M 58 74 C 64 78 60 84 60 84 C 60 84 53 80 58 74 Z" fill="url(#logoRedGrad)" opacity="0.8" />
      </svg>

      <div className="brand-logo-text-block">
        <span className="brand-title-primary">TRUNGDUCFOODLY</span>
        <span className="brand-title-secondary">✦ 5-STAR HAUTE CUISINE ✦</span>
      </div>
    </div>
  );
}
