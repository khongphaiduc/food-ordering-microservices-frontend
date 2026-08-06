import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Boxes, Calendar, Filter, Search, RefreshCw, 
  AlertCircle, ShieldAlert, PackageOpen, CheckCircle2, 
  Eye, ArrowUpDown, ChevronLeft, ChevronRight, PlusCircle,
  TrendingUp, X
} from 'lucide-react';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Khởi tạo ngày hiện tại của local
  const getTodayLocalDateStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    date: getTodayLocalDateStr(),
    categoryId: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProduct, setTotalProduct] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // State phục vụ bổ sung tồn kho (Restock)
  const [restockItem, setRestockItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(50);
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState(null);
  const [restockSuccess, setRestockSuccess] = useState(false);

  // Cấu hình Header chứa Token
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    };
  }, []);

  // Tải danh sách danh mục sản phẩm
  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/products/category`, getAuthHeader());
      setCategories(response.data.list || []);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  }, [apiUrl, getAuthHeader]);

  // Tải dữ liệu tồn kho từ API
  const loadInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/products/inventory`, {
        params: {
          date: filters.date,
          categoryid: filters.categoryId,
          pageIndex: currentPage,
          pageSize: pageSize
        },
        ...getAuthHeader()
      });
      setInventoryList(response.data.list || []);
      setTotalProduct(response.data.totalProduct || 0);
      setPageSize(response.data.pageSize || 10);
    } catch (err) {
      console.error("Lỗi khi kết nối với máy chủ:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Bạn không có quyền truy cập tính năng này.");
      } else {
        setError(err.response?.data?.message || "Đã xảy ra lỗi khi kết nối với máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, apiUrl, getAuthHeader]);

  // Xử lý gửi API bổ sung tồn kho
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockItem) return;
    if (restockQuantity < 1) {
      setRestockError("Số lượng bổ sung phải tối thiểu là 1.");
      return;
    }

    setRestockLoading(true);
    setRestockError(null);

    const payload = {
      productId: restockItem.productId,
      inventoryDate: restockItem.inventoryDate,
      quantity: parseInt(restockQuantity, 10)
    };

    try {
      await axios.post(`${apiUrl}/admin/inventory/restock`, payload, getAuthHeader());
      setRestockSuccess(true);
    } catch (err) {
      console.error("Lỗi khi bổ sung tồn kho:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setRestockError("Bạn không có quyền thực hiện thao tác này.");
      } else {
        setRestockError(err.response?.data?.message || err.response?.data?.Message || "Đã xảy ra lỗi khi kết nối với máy chủ.");
      }
    } finally {
      setRestockLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  // Xử lý bộ lọc thay đổi
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  // Tính toán các chỉ số thống kê từ danh sách hiện tại
  const stats = React.useMemo(() => {
    let totalProducts = inventoryList.length;
    let totalInitial = 0;
    let totalSold = 0;
    let totalRemaining = 0;
    let outOfStock = 0;

    inventoryList.forEach(item => {
      totalInitial += (item.initialQuantity || 0);
      totalSold += (item.soldQuantity || 0);
      totalRemaining += (item.remainingQuantity || 0);
      if ((item.remainingQuantity || 0) <= 0) {
        outOfStock += 1;
      }
    });

    return { totalProducts, totalInitial, totalSold, totalRemaining, outOfStock };
  }, [inventoryList]);

  // Lọc danh sách sản phẩm cục bộ theo chuỗi tìm kiếm
  const filteredInventory = React.useMemo(() => {
    return inventoryList.filter(item => {
      const nameMatch = item.productName?.toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = item.productId?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || catMatch || idMatch;
    });
  }, [inventoryList, searchQuery]);

  // Hiển thị giao diện khi bị chặn quyền truy cập (401/403)
  if (error === "Bạn không có quyền truy cập tính năng này.") {
    return (
      <div className="access-denied-container">
        <ShieldAlert size={64} color="#ef4444" />
        <h2>Truy cập bị từ chối</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="inventory-page-container">
      {/* ERROR BANNER */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadInventoryData}>Thử lại</button>
        </div>
      )}

      {/* STATS CARDS GRID */}
      <div className="stats-grid-layout">
        {/* Thẻ 1: Tổng số sản phẩm */}
        <div className="stat-item-card">
          <div className="stat-icon bg-blue"><PackageOpen size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Sản phẩm theo dõi</span>
            <h2 className="stat-main-value">{stats.totalProducts} món</h2>
            <p className="stat-sub">Đang hiển thị</p>
          </div>
        </div>

        {/* Thẻ 2: Tổng tồn kho ban đầu */}
        <div className="stat-item-card">
          <div className="stat-icon bg-orange"><Boxes size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng tồn kho (Initial)</span>
            <h2 className="stat-main-value">{stats.totalInitial}</h2>
            <p className="stat-sub">Khởi tạo trong ngày</p>
          </div>
        </div>

        {/* Thẻ 3: Tổng sản phẩm đã bán */}
        <div className="stat-item-card">
          <div className="stat-icon bg-green"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Đã tiêu thụ (Sold)</span>
            <h2 className="stat-main-value">{stats.totalSold}</h2>
            <p className="stat-sub">Hiệu suất: {stats.totalInitial > 0 ? ((stats.totalSold / stats.totalInitial) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Thẻ 4: Sản phẩm hết hàng */}
        <div className={`stat-item-card ${stats.outOfStock > 0 ? 'alert-border' : ''}`}>
          <div className={`stat-icon ${stats.outOfStock > 0 ? 'bg-red' : 'bg-slate'}`}><AlertCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Hết hàng / Cần nhập</span>
            <h2 className="stat-main-value" style={{ color: stats.outOfStock > 0 ? '#ef4444' : 'inherit' }}>
              {stats.outOfStock} món
            </h2>
            <p className="stat-sub">Mức tồn kho = 0</p>
          </div>
        </div>
      </div>

      {/* FILTER & TOOLBAR CARD */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Ngày kiểm kho</label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input 
                type="date" 
                name="date" 
                value={filters.date} 
                onChange={handleFilterChange} 
                className="filter-input-field" 
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Danh mục</label>
            <div className="input-with-icon">
              <Filter size={16} className="input-icon" />
              <select 
                name="categoryId" 
                value={filters.categoryId} 
                onChange={handleFilterChange} 
                className="filter-input-field"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.idCategory} value={cat.idCategory}>
                    {cat.nameCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group search-group">
            <label>Tìm kiếm sản phẩm</label>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Nhập tên, ID hoặc danh mục..." 
                className="filter-input-field"
              />
            </div>
          </div>

          <div className="filter-group refresh-btn-group">
            <label>&nbsp;</label>
            <button className="refresh-button" onClick={loadInventoryData} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>

          <div className="filter-group refresh-btn-group">
            <label>&nbsp;</label>
            <button className="create-inventory-btn" onClick={() => navigate('/management/inventory/create')}>
              <PlusCircle size={18} />
              Tạo tồn kho mới
            </button>
          </div>
        </div>
      </div>

      {/* INVENTORY TABLE SECTION */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Ngày</th>
              <th className="text-center">Ban đầu</th>
              <th className="text-center">Đã bán</th>
              <th className="text-center">Còn lại</th>
              <th>Trạng thái hoạt động</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="loading-state-cell">
                  <div className="table-spinner-loader">
                    <RefreshCw className="animate-spin" size={24} />
                    <span>Đang tải dữ liệu hàng tồn kho...</span>
                  </div>
                </td>
              </tr>
            ) : filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state-cell">
                  Không tìm thấy sản phẩm nào trong kho khớp với điều kiện.
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => {
                const isOutOfStock = (item.remainingQuantity || 0) <= 0;
                const isLowStock = !isOutOfStock && (item.remainingQuantity || 0) <= 10;
                
                return (
                  <tr key={item.productId} className={isOutOfStock ? "row-out-of-stock" : ""}>
                    <td className="font-bold font-mono text-small">
                      #{item.productId?.substring(0, 8)}
                    </td>
                    <td>
                      <span className="product-name-txt">{item.productName}</span>
                    </td>
                    <td>
                      <span className="category-tag">{item.categoryName || 'Chưa phân loại'}</span>
                    </td>
                    <td>
                      <span className="date-txt">{item.inventoryDate}</span>
                    </td>
                    <td className="text-center font-bold">{item.initialQuantity}</td>
                    <td className="text-center font-bold text-green-color">{item.soldQuantity}</td>
                    <td className="text-center">
                      <span className={`remaining-badge ${isOutOfStock ? 'badge-out' : isLowStock ? 'badge-low' : 'badge-good'}`}>
                        {item.remainingQuantity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-indicator ${item.isAvailable ? 'available' : 'unavailable'}`}>
                        {item.isAvailable ? '● Đang bán' : '● Tạm ngưng'}
                      </span>
                    </td>
                    <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderBottom: 'inherit' }}>
                      <button 
                        className="action-restock-btn" 
                        onClick={() => {
                          setRestockItem(item);
                          setRestockQuantity(50);
                          setRestockError(null);
                          setRestockSuccess(false);
                        }}
                        title="Nhập thêm hàng (Restock)"
                      >
                        <TrendingUp size={14} />
                        <span>Nhập thêm</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* PHÂN TRANG */}
        <div className="pagination">
          <p className="page-text">
            Trang <b>{currentPage}</b> / {Math.ceil(totalProduct / pageSize) || 1} (Tổng cộng: <b>{totalProduct}</b> sản phẩm)
          </p>
          <div className="page-btns">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              title="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage * pageSize >= totalProduct} 
              onClick={() => setCurrentPage(prev => prev + 1)}
              title="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* RESTOCK MODAL OVERLAY */}
      {restockItem && (
        <div className="modal-backdrop-overlay">
          <div className="restock-modal-card">
            <header className="modal-header">
              <div className="modal-title-wrapper">
                <TrendingUp size={20} className="modal-title-icon" />
                <h3>Bổ Sung Tồn Kho (Restock)</h3>
              </div>
              <button 
                type="button" 
                className="close-modal-btn" 
                onClick={() => { setRestockItem(null); setRestockError(null); setRestockSuccess(false); }}
              >
                <X size={20} />
              </button>
            </header>

            {restockSuccess ? (
              <div className="modal-success-content">
                <CheckCircle2 size={48} className="success-icon" />
                <h4>Bổ sung kho thành công!</h4>
                <p>Món ăn <strong>{restockItem.productName}</strong> đã được bổ sung thêm <strong>{restockQuantity}</strong> phần vào ngày {restockItem.inventoryDate}.</p>
                <button 
                  type="button"
                  className="modal-ok-btn"
                  onClick={() => {
                    setRestockItem(null);
                    setRestockSuccess(false);
                    loadInventoryData(); // Tải lại dữ liệu tồn kho để thấy số lượng mới
                  }}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <form onSubmit={handleRestockSubmit} className="modal-form-content">
                {restockError && (
                  <div className="modal-error-alert">
                    <AlertCircle size={16} />
                    <span>{restockError}</span>
                  </div>
                )}
                
                <div className="modal-info-grid">
                  <div className="info-item">
                    <span className="info-label">Tên sản phẩm</span>
                    <strong className="info-value text-orange">{restockItem.productName}</strong>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày kiểm kho</span>
                    <span className="info-value font-mono">{restockItem.inventoryDate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tồn kho ban đầu</span>
                    <span className="info-value">{restockItem.initialQuantity} phần</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tồn kho hiện tại</span>
                    <span className="info-value highlight">{restockItem.remainingQuantity} phần</span>
                  </div>
                </div>

                <div className="modal-input-group">
                  <label className="required-label">Số lượng bổ sung (Quantity)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={restockQuantity} 
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    required
                    autoFocus
                    className="modal-input"
                  />
                  <span className="input-tip">Số lượng phải lớn hơn hoặc bằng 1.</span>
                </div>

                <footer className="modal-footer-btns">
                  <button 
                    type="button" 
                    className="modal-cancel-btn" 
                    onClick={() => { setRestockItem(null); setRestockError(null); }}
                    disabled={restockLoading}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="modal-submit-btn" 
                    disabled={restockLoading}
                  >
                    {restockLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Đang bổ sung...
                      </>
                    ) : (
                      'Xác nhận bổ sung'
                    )}
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
