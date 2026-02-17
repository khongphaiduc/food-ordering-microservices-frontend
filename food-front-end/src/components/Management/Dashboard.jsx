import React from 'react';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import './Dashboard.css'; // Import file CSS mới

const StatCard = ({ title, value, icon, colorClass, trend, trendValue }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div className={`icon-wrapper ${colorClass}`}>
        {icon}
      </div>
      <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trendValue}
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const DashboardOverview = () => {
  const stats = [
    { title: "Doanh thu hôm nay", value: "2,450,000đ", icon: <DollarSign size={22} />, colorClass: "bg-blue-50 text-blue-600", trend: "up", trendValue: "12%" },
    { title: "Đơn hàng mới", value: "18", icon: <ShoppingBag size={22} />, colorClass: "bg-orange-50 text-orange-600", trend: "up", trendValue: "5%" },
    { title: "Khách hàng mới", value: "24", icon: <Users size={22} />, colorClass: "bg-green-50 text-green-600", trend: "down", trendValue: "2%" },
    { title: "Tỉ lệ hoàn thành", value: "94%", icon: <TrendingUp size={22} />, colorClass: "bg-purple-50 text-purple-600", trend: "up", trendValue: "8%" }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm">Chào mừng trở lại, FOODLY đang vận hành tốt.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
          Xuất báo cáo
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => <StatCard key={index} {...item} />)}
      </div>

      <div className="content-grid">
        <div className="chart-section">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Biểu đồ doanh thu tuần này</h2>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-lg text-gray-400">
            <p>Sử dụng Recharts để vẽ biểu đồ tại đây</p>
          </div>
        </div>

        <div className="orders-section">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Đơn hàng vừa đặt</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">#</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Đơn hàng #5432{i}</p>
                  <p className="text-xs text-gray-500">2 món • 15:30</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">120k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;