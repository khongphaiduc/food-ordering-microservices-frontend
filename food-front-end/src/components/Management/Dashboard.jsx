import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, ShoppingBag, CheckCircle, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Loader2, Calendar, Filter, RefreshCw,
  BarChart2, LineChart as LineIcon, Coins
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import './Dashboard.css';

const DashboardOverview = () => {
  const today = new Date();
  
  // State quản lý filter Stats (API 1)
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().setDate(today.getDate() - 1)).toISOString().split('T')[0],
    toDate: today.toISOString().split('T')[0],
    compareType: 1
  });

  // State quản lý Biểu đồ (API 2 & API 3)
  const [chartDate, setChartDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });

  // 'order' hoặc 'profit'
  const [activeDataType, setActiveDataType] = useState('order'); 
  // 'bar' hoặc 'line'
  const [chartType, setChartType] = useState('bar');

  const [statsData, setStatsData] = useState(null);
  const [orderChartData, setOrderChartData] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, orderRes, profitRes] = await Promise.all([
        fetch(`https://localhost:7150/orders/statistic?FromDate=${filters.fromDate}&ToDate=${filters.toDate}&CompareType=${filters.compareType}`),
        fetch(`https://localhost:7150/orders/statistic/order?year=${chartDate.year}&month=${chartDate.month}`),
        fetch(`https://localhost:7150/orders/statistic/prefit?year=${chartDate.year}&month=${chartDate.month}`)
      ]);
      
      const statsJson = await statsRes.json();
      const orderJson = await orderRes.json();
      const profitJson = await profitRes.json();

      setStatsData(statsJson);
      setOrderChartData(orderJson.data || []);
      setProfitChartData(profitJson.data || []);
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, chartDate]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  // Lấy data và cấu hình dựa trên loại biểu đồ đang chọn
  const currentData = activeDataType === 'order' ? orderChartData : profitChartData;
  const dataKey = activeDataType === 'order' ? 'orderCount' : 'amount';
  const chartColor = activeDataType === 'order' ? '#f97316' : '#2563eb';

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION */}
      <div className="dashboard-card header-section">
        <div className="filter-group-row">
          <div className="filter-box">
            <Calendar size={16} />
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value})} />
            <span>đến</span>
            <input type="date" value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value})} />
          </div>
          <div className="filter-box">
            <Filter size={16} />
            <select value={filters.compareType} onChange={(e) => setFilters({...filters, compareType: e.target.value})}>
              <option value="0">Không đối chiếu</option>
              <option value="1">So với hôm qua</option>
              <option value="2">So với tuần trước</option>
            </select>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid-layout">
        <div className="stat-item-card">
          <div className="stat-icon bg-blue"><DollarSign /></div>
          <div className="stat-info">
            <span className="stat-label">Doanh thu hiện tại</span>
            <h2 className="stat-main-value">{formatVND(statsData?.currentRevenue)}</h2>
            <div className={`trend-indicator ${statsData?.revenueGrowthPercent >= 0 ? 'up' : 'down'}`}>
              {statsData?.revenueGrowthPercent}% {statsData?.revenueGrowthPercent >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            </div>
            <p className="stat-sub">Chênh lệch: {formatVND(statsData?.revenueDifference)}</p>
          </div>
        </div>

        <div className="stat-item-card">
          <div className="stat-icon bg-orange"><ShoppingBag /></div>
          <div className="stat-info">
            <span className="stat-label">Số đơn hàng</span>
            <h2 className="stat-main-value">{statsData?.currentOrderCount} đơn</h2>
            <p className="stat-sub">Kỳ trước: {statsData?.compareOrderCount} đơn</p>
          </div>
        </div>

        <div className="stat-item-card">
          <div className="stat-icon bg-green"><CheckCircle /></div>
          <div className="stat-info">
            <span className="stat-label">Tỉ lệ hoàn thành</span>
            <h2 className="stat-main-value">{statsData?.percentComplation}%</h2>
            <div className="mini-progress-bar">
              <div className="fill" style={{width: `${statsData?.percentComplation}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="dashboard-card chart-container">
        <div className="chart-header-row">
          <div>
            <div className="chart-tabs">
                <button 
                    className={`tab-btn ${activeDataType === 'order' ? 'active' : ''}`}
                    onClick={() => setActiveDataType('order')}
                >
                    <ShoppingBag size={16} /> Đơn hàng
                </button>
                <button 
                    className={`tab-btn ${activeDataType === 'profit' ? 'active' : ''}`}
                    onClick={() => setActiveDataType('profit')}
                >
                    <Coins size={16} /> Lợi nhuận
                </button>
            </div>
            <p className="stat-sub">Dữ liệu tháng {chartDate.month}/{chartDate.year}</p>
          </div>
          
          <div className="chart-controls">
            <div className="chart-type-toggle">
              <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>
                <BarChart2 size={18} />
              </button>
              <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>
                <LineIcon size={18} />
              </button>
            </div>

            <div className="chart-selectors">
              <select value={chartDate.month} onChange={(e) => setChartDate({...chartDate, month: parseInt(e.target.value)})}>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
              </select>
              <select value={chartDate.year} onChange={(e) => setChartDate({...chartDate, year: parseInt(e.target.value)})}>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bar-chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            {chartType === 'bar' ? (
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b'}}
                    tickFormatter={(val) => activeDataType === 'profit' ? `${val/1000}k` : val}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(val) => activeDataType === 'profit' ? formatVND(val) : [`${val} đơn`, 'Số lượng']}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry[dataKey] > 0 ? chartColor : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b'}}
                    tickFormatter={(val) => activeDataType === 'profit' ? `${val/1000}k` : val}
                />
                <Tooltip 
                  formatter={(val) => activeDataType === 'profit' ? formatVND(val) : [`${val} đơn`, 'Số lượng']}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey={dataKey}
                  stroke={chartColor}
                  strokeWidth={3} 
                  dot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;