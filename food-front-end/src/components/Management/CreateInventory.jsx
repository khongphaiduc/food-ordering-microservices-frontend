import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Boxes, Search, Calendar, 
  Save, Loader2, CheckCircle2, AlertCircle, 
  X, ChevronDown, Package, ToggleLeft, ToggleRight,
  TrendingUp, RefreshCw
} from 'lucide-react';
import './CreateInventory.css';

const CreateInventory = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7150";

  // Quản lý tab: 'create' | 'restock'
  const [activeTab, setActiveTab] = useState('create');

  // Khởi tạo ngày hiện tại của local
  const getTodayLocalDateStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  // State chung cho form
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventoryDate, setInventoryDate] = useState(getTodayLocalDateStr());
  
  // State riêng của Tab Create
  const [initialQuantity, setInitialQuantity] = useState(100);
  const [isAvailable, setIsAvailable] = useState(true);

  // State riêng của Tab Restock
  const [restockQuantity, setRestockQuantity] = useState(50);

  // States hỗ trợ tìm kiếm sản phẩm
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // States quản lý submit
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Reset form khi đổi tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedProduct(null);
    setSearchQuery('');
    setInventoryDate(getTodayLocalDateStr());
    setInitialQuantity(100);
    setRestockQuantity(50);
    setIsAvailable(true);
    setSuccessData(null);
    setErrorMsg(null);
  };

  // Cấu hình Header chứa Token
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    };
  }, []);

  // Tải danh sách sản phẩm khi mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setErrorMsg(null);
      try {
        const response = await axios.get(`${apiUrl}/products?pageSize=1000`, getAuthHeader());
        setProducts(response.data.list || response.data.items || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
        setErrorMsg("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [apiUrl, getAuthHeader]);

  // Click ra ngoài để đóng dropdown tìm kiếm sản phẩm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc sản phẩm cục bộ theo từ khóa
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setErrorMsg("Vui lòng chọn sản phẩm!");
      return;
    }

    setSubmitLoading(true);
    setErrorMsg(null);

    // Xác định endpoint, payload dựa trên activeTab
    const isCreate = activeTab === 'create';
    const endpoint = isCreate ? `${apiUrl}/admin/inventory` : `${apiUrl}/admin/inventory/restock`;
    
    const payload = isCreate ? {
      productId: selectedProduct.id,
      inventoryDate: inventoryDate ? inventoryDate : null,
      initialQuantity: parseInt(initialQuantity, 10),
      isAvailable: isAvailable
    } : {
      productId: selectedProduct.id,
      inventoryDate: inventoryDate ? inventoryDate : null,
      quantity: parseInt(restockQuantity, 10)
    };

    try {
      const response = await axios.post(endpoint, payload, getAuthHeader());
      setSuccessData({
        ...response.data,
        type: activeTab, // Lưu lại loại tab vừa gửi thành công
        productName: selectedProduct.name, // Lưu tên sản phẩm để dự phòng nếu API không trả về tên
      });
      
      // Reset form sau khi thành công
      setSelectedProduct(null);
      setSearchQuery('');
      setInitialQuantity(100);
      setRestockQuantity(50);
      setIsAvailable(true);
    } catch (err) {
      console.error(`Lỗi khi ${isCreate ? 'khởi tạo' : 'bổ sung'} tồn kho:`, err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setErrorMsg("Bạn không có quyền thực hiện thao tác này (Yêu cầu tài khoản Admin).");
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data?.Message || "Đã xảy ra lỗi khi kết nối với máy chủ.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="create-inventory-container">
      {/* HEADER */}
      <header className="create-inventory-header">
        <button className="back-btn" onClick={() => navigate('/management/inventory')}>
          <ChevronLeft size={20} /> Quay lại danh sách
        </button>
        <div className="header-title-group">
          <Boxes className="header-icon" size={28} />
          <h2>Quản Lý Nhập Hàng & Tồn Kho</h2>
        </div>
      </header>

      {/* TABS SELECTOR */}
      <div className="tabs-container">
        <button 
          className={`tab-item ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          <Boxes size={18} />
          Khởi tạo tồn kho mới
        </button>
        <button 
          className={`tab-item ${activeTab === 'restock' ? 'active' : ''}`}
          onClick={() => handleTabChange('restock')}
        >
          <TrendingUp size={18} />
          Bổ sung hàng ngày (Restock)
        </button>
      </div>

      <div className="create-inventory-layout">
        {/* BANNER THÀNH CÔNG */}
        {successData && (
          <div className="success-banner-card">
            <div className="banner-left">
              <CheckCircle2 size={32} className="success-icon" />
              <div>
                <h3>{successData.type === 'create' ? 'Khởi tạo thành công!' : 'Bổ sung kho thành công!'}</h3>
                <p>{successData.message || "Thông tin đã được ghi nhận trên máy chủ."}</p>
              </div>
            </div>

            {/* HIỂN THỊ CHI TIẾT TỒN KHO SAU KHI THÀNH CÔNG */}
            <div className="inventory-preview-details">
              <div className="preview-row">
                <span>Sản phẩm:</span>
                <strong>{successData.inventory?.productName || successData.productName || "Sản phẩm"}</strong>
              </div>
              <div className="preview-row">
                <span>Ngày kiểm:</span>
                <strong>{successData.inventory?.inventoryDate || successData.inventoryDate || inventoryDate}</strong>
              </div>
              
              {successData.type === 'create' ? (
                <>
                  <div className="preview-row">
                    <span>Số lượng ban đầu:</span>
                    <strong>{successData.inventory?.initialQuantity ?? successData.initialQuantity} món</strong>
                  </div>
                  <div className="preview-row">
                    <span>Trạng thái:</span>
                    <span className={`status-badge ${successData.inventory?.isAvailable ? 'active' : 'inactive'}`}>
                      {successData.inventory?.isAvailable ? 'Đang bán' : 'Tạm ngưng'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="preview-row">
                    <span>Số lượng nhập thêm:</span>
                    <strong style={{color: '#16a34a'}}>+{successData.quantity ?? restockQuantity} món</strong>
                  </div>
                  {successData.inventory && (
                    <>
                      <div className="preview-row">
                        <span>Tổng tồn kho (Initial):</span>
                        <strong>{successData.inventory.initialQuantity} món</strong>
                      </div>
                      <div className="preview-row">
                        <span>Tồn thực tế (Remaining):</span>
                        <strong style={{color: '#ea580c'}}>{successData.inventory.remainingQuantity} món</strong>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            
            <div className="banner-actions">
              <button className="secondary-action-btn" onClick={() => setSuccessData(null)}>
                Tiếp tục thực hiện
              </button>
              <button className="primary-action-btn" onClick={() => navigate('/management/inventory')}>
                Xem bảng tồn kho
              </button>
            </div>
          </div>
        )}

        {/* BANNER BÁO LỖI */}
        {errorMsg && (
          <div className="error-banner-card">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
            <button className="close-err-btn" onClick={() => setErrorMsg(null)}><X size={16} /></button>
          </div>
        )}

        {/* FORM CHÍNH */}
        <form onSubmit={handleSubmit} className="inventory-form-card">
          <div className="form-grid">
            
            {/* CHỌN SẢN PHẨM */}
            <div className="form-group select-product-group" ref={dropdownRef}>
              <label className="form-labelRequired">Chọn sản phẩm</label>
              <div 
                className={`custom-select-trigger ${isOpenDropdown ? 'active' : ''} ${!selectedProduct ? 'placeholder' : ''}`}
                onClick={() => !loadingProducts && setIsOpenDropdown(!isOpenDropdown)}
              >
                <div className="selected-product-info">
                  <Package size={18} className="product-icon" />
                  {loadingProducts ? (
                    <span className="loading-txt">Đang tải danh sách món ăn...</span>
                  ) : selectedProduct ? (
                    <div>
                      <span className="p-name">{selectedProduct.name}</span>
                      <span className="p-price"> — {selectedProduct.price?.toLocaleString()}đ</span>
                    </div>
                  ) : (
                    <span>-- Nhấp để tìm và chọn sản phẩm --</span>
                  )}
                </div>
                <ChevronDown size={18} className="chevron-icon" />
              </div>

              {/* DROPDOWN CHỌN SẢN PHẨM */}
              {isOpenDropdown && (
                <div className="custom-dropdown-panel">
                  <div className="dropdown-search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Tìm theo tên món hoặc ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    {searchQuery && (
                      <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <ul className="product-options-list">
                    {filteredProducts.length === 0 ? (
                      <li className="no-options-item">Không tìm thấy sản phẩm nào</li>
                    ) : (
                      filteredProducts.map(product => (
                        <li 
                          key={product.id} 
                          className={`product-option-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsOpenDropdown(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="product-details">
                            <span className="option-name">{product.name}</span>
                            <span className="option-id">ID: #{product.id.substring(0, 8)}</span>
                          </div>
                          <span className="option-price">{product.price?.toLocaleString()}đ</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* NGÀY KIỂM KHO / BỔ SUNG */}
            <div className="form-group">
              <label className="form-label">
                {activeTab === 'create' ? 'Ngày kiểm kho (Mặc định: Hôm nay)' : 'Ngày bổ sung hàng'}
              </label>
              <div className="input-icon-wrapper">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  value={inventoryDate} 
                  onChange={(e) => setInventoryDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* SỐ LƯỢNG (Dựa trên activeTab) */}
            {activeTab === 'create' ? (
              <>
                {/* SỐ LƯỢNG BAN ĐẦU */}
                <div className="form-group">
                  <label className="form-labelRequired">Số lượng khởi tạo</label>
                  <input 
                    type="number" 
                    min="0"
                    value={initialQuantity} 
                    onChange={(e) => setInitialQuantity(e.target.value)}
                    placeholder="Ví dụ: 100"
                    className="form-input text-quantity"
                    required
                  />
                  <span className="form-help-text">Số lượng sản phẩm phục vụ sẵn sàng đầu ngày.</span>
                </div>

                {/* TRẠNG THÁI HOẠT ĐỘNG */}
                <div className="form-group toggle-group">
                  <div className="toggle-label-desc">
                    <label className="form-label" style={{marginBottom: '2px'}}>Trạng thái bán hàng</label>
                    <span className="form-help-text">Cho phép khách đặt hàng món này ngay lập tức.</span>
                  </div>
                  <button 
                    type="button" 
                    className={`switch-btn ${isAvailable ? 'on' : 'off'}`}
                    onClick={() => setIsAvailable(!isAvailable)}
                  >
                    {isAvailable ? (
                      <>
                        <span className="switch-text">Đang bán</span>
                        <ToggleRight size={32} className="switch-icon text-green" />
                      </>
                    ) : (
                      <>
                        <span className="switch-text text-gray">Tạm ngưng</span>
                        <ToggleLeft size={32} className="switch-icon text-gray" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* SỐ LƯỢNG BỔ SUNG */
              <div className="form-group">
                <label className="form-labelRequired">Số lượng bổ sung (Restock)</label>
                <input 
                  type="number" 
                  min="1"
                  value={restockQuantity} 
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Ví dụ: 50"
                  className="form-input text-quantity"
                  required
                />
                <span className="form-help-text" style={{color: '#ea580c'}}>Số lượng món ăn nhập thêm vào kho cho ngày đã chọn. Phải lớn hơn hoặc bằng 1.</span>
              </div>
            )}

          </div>

          {/* NÚT SUBMIT */}
          <footer className="form-footer">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => navigate('/management/inventory')}
              disabled={submitLoading}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={submitLoading || loadingProducts}
              style={{ background: activeTab === 'restock' ? '#ea580c' : '#4318FF', boxShadow: activeTab === 'restock' ? '0 4px 12px rgba(234, 88, 12, 0.15)' : '0 4px 12px rgba(67, 24, 255, 0.15)' }}
            >
              {submitLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {activeTab === 'create' ? 'Đang khởi tạo...' : 'Đang bổ sung...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {activeTab === 'create' ? 'Lưu tồn kho' : 'Bổ sung tồn kho'}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateInventory;
