import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DollarSign, ShoppingBag, CheckCircle, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Loader2, Calendar, Filter, RefreshCw,
  BarChart2, LineChart as LineIcon, Coins, AlertCircle, ShieldAlert,
  Sparkles, Clock, PieChart as PieIcon, Award, Utensils, Zap, Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import BrandLogo from '../homepage/BrandLogo';
import './Dashboard.css';

const DashboardOverview = () => {
  const today = new Date();
  
  // Bộ lọc thời gian (Hôm nay, Theo Tháng, Theo Quý, Theo Năm)
  const [reportPeriod, setReportPeriod] = useState('today'); // 'today' | 'month' | 'quarter' | 'year'
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(`Q${Math.floor(today.getMonth() / 3) + 1}`);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // --------------------------------------------------------------------------
  // DỮ LIỆU MẪU CHUYÊN NGHIỆP CHO HỆ THỐNG ĐẶT ĐỒ ĂN (FOOD ORDERING SYSTEM)
  // --------------------------------------------------------------------------

  // 0. Thống kê trực tiếp Ngày Hôm Nay (Live Today Stats)
  const todayStats = useMemo(() => ({
    dateStr: today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    doanhThu: 18450000,
    donHang: 142,
    donHoanThanh: 128,
    donDangLam: 11,
    donDangGiao: 3,
    donHuy: 0,
    trungBinhDon: 129930,
    monHotNhat: 'Cơm Tấm Sườn Bì Chả',
    soLuongMonHot: 48,
    khungGioVang: '11:30 - 13:00',
    growthComparedYesterday: '+15.4%'
  }), [today]);

  // 1. Biểu đồ đường (Line Chart): Doanh Thu Theo Tháng trong năm
  const monthlyRevenueData = useMemo(() => [
    { label: 'Tháng 1', doanhThu: 145000000, donHang: 1280, loiNhuan: 43500000 },
    { label: 'Tháng 2 (Tết)', doanhThu: 225000000, donHang: 1980, loiNhuan: 72000000 },
    { label: 'Tháng 3', doanhThu: 168000000, donHang: 1420, loiNhuan: 50400000 },
    { label: 'Tháng 4', doanhThu: 182000000, donHang: 1560, loiNhuan: 54600000 },
    { label: 'Tháng 5', doanhThu: 195000000, donHang: 1680, loiNhuan: 58500000 },
    { label: 'Tháng 6', doanhThu: 210000000, donHang: 1840, loiNhuan: 63000000 },
    { label: 'Tháng 7', doanhThu: 188000000, donHang: 1590, loiNhuan: 56400000 },
    { label: 'Tháng 8', doanhThu: 205000000, donHang: 1720, loiNhuan: 61500000 },
    { label: 'Tháng 9', doanhThu: 225000000, donHang: 1910, loiNhuan: 67500000 },
    { label: 'Tháng 10', doanhThu: 240000000, donHang: 2050, loiNhuan: 72000000 },
    { label: 'Tháng 11', doanhThu: 258000000, donHang: 2180, loiNhuan: 77400000 },
    { label: 'Tháng 12', doanhThu: 290000000, donHang: 2450, loiNhuan: 87000000 },
  ], []);

  // 2. Biểu đồ cột (Bar Chart): Thống kê đơn hàng theo Quý
  const quarterlyData = useMemo(() => [
    { label: 'Quý 1 (Q1)', soDon: 4680, doanhThu: 538000000, hoaThanh: 97.2 },
    { label: 'Quý 2 (Q2)', soDon: 5080, doanhThu: 587000000, hoaThanh: 98.1 },
    { label: 'Quý 3 (Q3)', soDon: 5220, doanhThu: 618000000, hoaThanh: 96.8 },
    { label: 'Quý 4 (Q4)', soDon: 6680, doanhThu: 788000000, hoaThanh: 99.0 },
  ], []);

  // 3. Biểu đồ tròn (Pie Chart): Cơ cấu doanh thu theo Danh mục Món ăn
  const categoryShareData = useMemo(() => [
    { name: 'Cơm & Bún Phở', value: 38, amount: 961780000, color: '#dc2626' },
    { name: 'Đồ Uống & Trà Sữa', value: 24, amount: 607440000, color: '#d97706' },
    { name: 'Lẩu & Nướng Nóng', value: 18, amount: 455580000, color: '#2563eb' },
    { name: 'Đồ Ăn Vặt', value: 12, amount: 303720000, color: '#16a34a' },
    { name: 'Tráng Miệng & Bánh', value: 8, amount: 202480000, color: '#9333ea' },
  ], []);

  // 4. Biểu đồ miền (Area Chart): Phân phối đơn hàng theo Khung Giờ Cao Điểm
  const hourlyPeakData = useMemo(() => [
    { timeSlot: '06:00 - 08:30 (Sáng)', soDon: 420, doUyTinh: 92 },
    { timeSlot: '11:00 - 13:30 (Trưa)', soDon: 1850, doUyTinh: 99 },
    { timeSlot: '14:00 - 16:30 (Chiều)', soDon: 740, doUyTinh: 94 },
    { timeSlot: '17:30 - 20:30 (Tối)', soDon: 2190, doUyTinh: 98 },
    { timeSlot: '21:00 - 00:00 (Đêm)', soDon: 510, doUyTinh: 89 },
  ], []);

  // 5. Top 5 Món ăn bán chạy nhất
  const topSellingFoods = useMemo(() => [
    { rank: 1, name: 'Cơm Tấm Sườn Bì Chả Đặc Biệt', category: 'Cơm & Bún Phở', sold: 3420, revenue: 188100000, trend: '+18%', rating: 4.9 },
    { rank: 2, name: 'Phở Bò Tái Nạm Trứng Chèn', category: 'Cơm & Bún Phở', sold: 2890, revenue: 173400000, trend: '+14%', rating: 4.8 },
    { rank: 3, name: 'Trà Sữa Trân Châu Hoàng Gia', category: 'Đồ Uống', sold: 4150, revenue: 145250000, trend: '+22%', rating: 4.9 },
    { rank: 4, name: 'Bún Đậu Mắm Tôm Đầy Đủ', category: 'Cơm & Bún Phở', sold: 2100, revenue: 136500000, trend: '+9%', rating: 4.7 },
    { rank: 5, name: 'Gà Rán Sốt Cay Hàn Quốc', category: 'Đồ Ăn Vặt', sold: 1950, revenue: 117000000, trend: '+12%', rating: 4.8 },
  ], []);

  // Thống kê tổng quan dựa theo bộ lọc
  const currentStats = useMemo(() => {
    if (reportPeriod === 'today') {
      return {
        revenue: todayStats.doanhThu,
        orders: todayStats.donHang,
        avgOrder: todayStats.trungBinhDon,
        growth: todayStats.growthComparedYesterday,
        completion: 97.8
      };
    } else if (reportPeriod === 'month') {
      const monthObj = monthlyRevenueData[selectedMonth - 1] || monthlyRevenueData[0];
      return {
        revenue: monthObj.doanhThu,
        orders: monthObj.donHang,
        avgOrder: Math.round(monthObj.doanhThu / monthObj.donHang),
        growth: '+14.5%',
        completion: 98.4
      };
    } else if (reportPeriod === 'quarter') {
      const qIndex = parseInt(selectedQuarter.replace('Q', ''), 10) - 1;
      const qObj = quarterlyData[qIndex] || quarterlyData[0];
      return {
        revenue: qObj.doanhThu,
        orders: qObj.soDon,
        avgOrder: Math.round(qObj.doanhThu / qObj.soDon),
        growth: '+18.2%',
        completion: qObj.hoaThanh
      };
    } else {
      const totalRev = monthlyRevenueData.reduce((acc, cur) => acc + cur.doanhThu, 0);
      const totalOrd = monthlyRevenueData.reduce((acc, cur) => acc + cur.donHang, 0);
      return {
        revenue: totalRev,
        orders: totalOrd,
        avgOrder: Math.round(totalRev / totalOrd),
        growth: '+24.8%',
        completion: 98.8
      };
    }
  }, [reportPeriod, todayStats, selectedMonth, selectedQuarter, monthlyRevenueData, quarterlyData]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="dashboard-container tet-dashboard-theme">
      {/* 1. HEADER DASHBOARD */}
      <div className="dashboard-header-card">
        <div className="header-brand-info">
          <BrandLogo size="small" />
          <div>
            <h1 className="header-title">Báo Cáo Tổng Quan Kinh Doanh 📊</h1>
            <p className="header-subtitle">
              {reportPeriod === 'today' ? `🔴 Trực tiếp hôm nay: ${todayStats.dateStr}` : 'Theo dõi doanh thu, số lượng đơn hàng và hiệu suất thực đơn theo thời gian'}
            </p>
          </div>
        </div>


        <div className="header-actions">
          {/* Bộ chọn thời gian báo cáo */}
          <div className="period-switch-group">
            <button 
              className={`period-btn ${reportPeriod === 'today' ? 'active' : ''}`}
              onClick={() => setReportPeriod('today')}
            >
              Hôm Nay 🔥
            </button>
            <button 
              className={`period-btn ${reportPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setReportPeriod('month')}
            >
              Theo Tháng
            </button>
            <button 
              className={`period-btn ${reportPeriod === 'quarter' ? 'active' : ''}`}
              onClick={() => setReportPeriod('quarter')}
            >
              Theo Quý
            </button>
            <button 
              className={`period-btn ${reportPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setReportPeriod('year')}
            >
              Theo Năm
            </button>
          </div>

          {/* Selector chi tiết */}
          {reportPeriod === 'month' && (
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
              className="dash-selector"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          )}

          {reportPeriod === 'quarter' && (
            <select 
              value={selectedQuarter} 
              onChange={e => setSelectedQuarter(e.target.value)}
              className="dash-selector"
            >
              <option value="Q1">Quý 1 (T1 - T3)</option>
              <option value="Q2">Quý 2 (T4 - T6)</option>
              <option value="Q3">Quý 3 (T7 - T9)</option>
              <option value="Q4">Quý 4 (T10 - T12)</option>
            </select>
          )}

          <button className="btn-dash-refresh" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* THỐNG KÊ TRỰC TIẾP RIÊNG CHO NGÀY HÔM NAY (NẾU ĐANG CHỌN HÔM NAY) */}
      {reportPeriod === 'today' && (
        <div className="today-live-card-container">
          <div className="live-card-top-bar">
            <div className="live-pulse-status">
              <span className="live-red-beacon"></span>
              <span className="live-text-signal">BÁO CÁO KINH DOANH TRỰC TIẾP (REALTIME ANALYTICS)</span>
            </div>
            <span className="live-date-label">📅 {todayStats.dateStr}</span>
          </div>

          <div className="today-live-grid">
            <div className="today-live-metric-card">
              <div className="metric-details">
                <span className="metric-tag">DOANH THU HÔM NAY</span>
                <h3 className="metric-val text-red">{formatVND(todayStats.doanhThu)}</h3>
                <span className="metric-sub green-txt">↑ {todayStats.growthComparedYesterday} so với hôm qua</span>
              </div>
            </div>

            <div className="today-live-metric-card">
              <div className="metric-details">
                <span className="metric-tag">ĐƠN HÀNG HÔM NAY</span>
                <h3 className="metric-val">{todayStats.donHang} <small className="unit-txt">đơn</small></h3>
                <div className="order-status-pills">
                  <span className="pill-done">✓ {todayStats.donHoanThanh} xong</span>
                  <span className="pill-cook">👨‍🍳 {todayStats.donDangLam} bếp</span>
                  <span className="pill-ship">🛵 {todayStats.donDangGiao} ship</span>
                </div>
              </div>
            </div>

            <div className="today-live-metric-card">
              <div className="metric-details">
                <span className="metric-tag">MÓN HOT NHẤT HÔM NAY</span>
                <h3 className="metric-val text-gold">{todayStats.monHotNhat}</h3>
                <span className="metric-sub">Đã bán <strong>{todayStats.soLuongMonHot} phần</strong></span>
              </div>
            </div>

            <div className="today-live-metric-card">
              <div className="metric-details">
                <span className="metric-tag">KHUNG GIỜ CAO ĐIỂM</span>
                <h3 className="metric-val">{todayStats.khungGioVang}</h3>
                <span className="metric-sub">Đạt <strong>68 đơn chốt</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* 2. SUMMARY KPI OVERVIEW CARDS */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card revenue">
          <div className="kpi-top">
            <span className="kpi-title">TỔNG DOANH THU</span>
          </div>
          <div className="kpi-main">
            <h2 className="kpi-number text-red">{formatVND(currentStats.revenue)}</h2>
            <div className="kpi-trend-pill up">
              <ArrowUpRight size={14} />
              <span>{currentStats.growth}</span>
            </div>
          </div>
          <span className="kpi-subtext">So với kỳ trước</span>
        </div>

        <div className="dash-kpi-card orders">
          <div className="kpi-top">
            <span className="kpi-title">TỔNG ĐƠN HÀNG</span>
          </div>
          <div className="kpi-main">
            <h2 className="kpi-number">{currentStats.orders.toLocaleString('vi-VN')} đơn</h2>
            <div className="kpi-trend-pill up">
              <ArrowUpRight size={14} />
              <span>+12.4%</span>
            </div>
          </div>
          <span className="kpi-subtext">Tỷ lệ giao đúng giờ 99%</span>
        </div>

        <div className="dash-kpi-card avg-order">
          <div className="kpi-top">
            <span className="kpi-title">GIÁ TRỊ TRUNG BÌNH / ĐƠN</span>
          </div>
          <div className="kpi-main">
            <h2 className="kpi-number">{formatVND(currentStats.avgOrder)}</h2>
            <div className="kpi-trend-pill up">
              <ArrowUpRight size={14} />
              <span>+5.8%</span>
            </div>
          </div>
          <span className="kpi-subtext">Món ăn kèm tăng 24%</span>
        </div>

        <div className="dash-kpi-card completion">
          <div className="kpi-top">
            <span className="kpi-title">TỶ LỆ HOÀN THÀNH</span>
          </div>
          <div className="kpi-main">
            <h2 className="kpi-number">{currentStats.completion}%</h2>
            <div className="kpi-progress-bar">
              <div className="kpi-progress-fill" style={{ width: `${currentStats.completion}%` }}></div>
            </div>
          </div>
          <span className="kpi-subtext">Đơn hủy & hoàn trả &lt; 1.2%</span>
        </div>
      </div>


      {/* 3. GRID 4 BIỂU ĐỒ RIÊNG BIỆT (CHARTS GRID 2x2) */}
      <div className="dash-charts-grid">

        {/* BIỂU ĐỒ 1: BIỂU ĐỒ ĐƯỜNG (LINE CHART) - DOANH THU THEO THÁNG */}
        <div className="chart-card-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <div className="chart-type-badge red">
                <LineIcon size={18} />
              </div>
              <div>
                <h3>Biểu Đồ Xu Hướng Doanh Thu Hàng Tháng</h3>
                <p>Theo dõi sự tăng trưởng doanh thu qua 12 tháng trong năm</p>
              </div>
            </div>
          </div>

          <div className="chart-body-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip 
                  formatter={(val) => [formatVND(val), 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="doanhThu" 
                  stroke="#dc2626" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: BIỂU ĐỒ CỘT (BAR CHART) - THỐNG KÊ ĐƠN HÀNG THEO QUÝ */}
        <div className="chart-card-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <div className="chart-type-badge orange">
                <BarChart2 size={18} />
              </div>
              <div>
                <h3>Biểu Đồ Thống Kê Số Lượng Đơn Theo Quý</h3>
                <p>So sánh tổng số lượng đơn hàng hoàn thành giữa các quý</p>
              </div>
            </div>
          </div>

          <div className="chart-body-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => [`${val.toLocaleString('vi-VN')} đơn`, 'Số đơn hàng']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="soDon" radius={[8, 8, 0, 0]}>
                  {quarterlyData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={index === 3 ? '#dc2626' : '#d97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ 3: BIỂU ĐỒ TRÒN (PIE CHART) - CƠ CẤU DANH MỤC MÓN ĂN */}
        <div className="chart-card-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <div className="chart-type-badge blue">
                <PieIcon size={18} />
              </div>
              <div>
                <h3>Biểu Đồ Cơ Cấu Doanh Thu Theo Danh Mục</h3>
                <p>Tỷ lệ phần trăm đóng góp doanh thu của từng nhóm thực đơn</p>
              </div>
            </div>
          </div>

          <div className="chart-body-wrapper pie-layout">
            <ResponsiveContainer width="55%" height={290}>
              <PieChart>
                <Pie
                  data={categoryShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryShareData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Tỷ lệ thị phần']} />
              </PieChart>
            </ResponsiveContainer>

            {/* Chú thích Legend bên cạnh */}
            <div className="pie-legend-list">
              {categoryShareData.map((cat) => (
                <div key={cat.name} className="legend-item-row">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                  <div className="legend-info">
                    <span className="legend-name">{cat.name}</span>
                    <span className="legend-percent">{cat.value}% ({formatVND(cat.amount)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BIỂU ĐỒ 4: BIỂU ĐỒ MIỀN (AREA CHART) - PHÂN PHỐI KHUNG GIỜ ĐẶT HÀNG */}
        <div className="chart-card-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <div className="chart-type-badge green">
                <Clock size={18} />
              </div>
              <div>
                <h3>Biểu Đồ Mật Độ Đặt Hàng Theo Khung Giờ</h3>
                <p>Xác định các khung giờ vàng có lượng khách đặt đồ ăn cao điểm</p>
              </div>
            </div>
          </div>

          <div className="chart-body-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={hourlyPeakData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timeSlot" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => [`${val} đơn đặt`, 'Số đơn trong giờ']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="soDon" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. BẢNG TOP MÓN ĂN BÁN CHẠY NHẤT */}
      <div className="top-foods-table-card">
        <div className="table-card-header">
          <div className="table-header-title">
            <Award size={20} className="text-red" />
            <div>
              <h3>Top 5 Món Ăn Bán Chạy Nhất (Best Sellers)</h3>
              <p>Danh sách các món ăn mang lại doanh thu cao nhất cho nhà hàng</p>
            </div>
          </div>
        </div>

        <div className="table-responsive-box">
          <table className="dash-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '60px' }}>HẠNG</th>
                <th>TÊN MÓN ĂN</th>
                <th>DANH MỤC</th>
                <th className="text-center">SỐ LƯỢNG BÁN</th>
                <th className="text-right">TỔNG DOANH THU</th>
                <th className="text-center">TĂNG TRƯỞNG</th>
                <th className="text-center">ĐÁNH GIÁ</th>
              </tr>
            </thead>
            <tbody>
              {topSellingFoods.map((food) => (
                <tr key={food.rank}>
                  <td className="text-center">
                    <span className={`rank-badge rank-${food.rank}`}>{food.rank}</span>
                  </td>
                  <td>
                    <span className="food-name-title">{food.name}</span>
                  </td>
                  <td>
                    <span className="food-cat-tag">{food.category}</span>
                  </td>
                  <td className="text-center font-bold">
                    {food.sold.toLocaleString('vi-VN')} phần
                  </td>
                  <td className="text-right font-bold text-red">
                    {formatVND(food.revenue)}
                  </td>
                  <td className="text-center text-green-color font-bold">
                    {food.trend}
                  </td>
                  <td className="text-center">
                    <span className="star-rating">⭐ {food.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardOverview;