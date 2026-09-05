import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Upload, X, Save, Loader2, Plus, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import longdentetImg from '../../assets/longdentet.png';
import canhdaoImg from '../../assets/canhdao.png';
import './AddProduct.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        idCategory: '',
        name: '',
        price: '',
        description: ''
    });

    const [mainImage, setMainImage] = useState(null);
    const [subImages, setSubImages] = useState([]);

    // Custom Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3500);
    };

    // State cho Modal tạo danh mục mới
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    // Fetch danh sách danh mục từ API /products/category
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("AccessToken");
            const headers = (token && token !== "null" && token !== "undefined") 
                ? { Authorization: `Bearer ${token}` } 
                : {};

            let response;
            try {
                // Lần 1: Gọi kèm Header (nếu có Token)
                response = await axios.get(`${apiUrl}/products/category`, { headers });
            } catch (err1) {
                console.warn("Thử gọi /products/category không header:", err1);
                try {
                    // Lần 2: Gọi không Header (cho API public)
                    response = await axios.get(`${apiUrl}/products/category`);
                } catch (err2) {
                    console.warn("Thử gọi /admin/categories làm fallback:", err2);
                    // Lần 3: Fallback sang /admin/categories
                    response = await axios.get(`${apiUrl}/admin/categories`, { headers });
                }
            }

            const rawData = response?.data;
            let categoryList = [];

            if (Array.isArray(rawData)) {
                categoryList = rawData;
            } else if (rawData && typeof rawData === 'object') {
                categoryList = rawData.list || rawData.data || rawData.categories || rawData.result || [];
            }

            console.log("Danh sách danh mục nhận được:", categoryList);
            setCategories(categoryList);
            return categoryList;
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
            setCategories([]);
            return [];
        }
    };

    // Fetch danh sách danh mục khi trang được load
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMainImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMainImage(e.target.files[0]);
        }
    };

    const handleSubImagesChange = (e) => {
        if (e.target.files) {
            setSubImages([...subImages, ...Array.from(e.target.files)]);
        }
    };

    const removeSubImage = (index) => {
        setSubImages(subImages.filter((_, i) => i !== index));
    };

    // Xử lý tạo danh mục mới qua API /admin/categories
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!categoryFormData.name.trim()) {
            showNotification("Vui lòng nhập tên danh mục!", "warning");
            return;
        }

        setCategoryLoading(true);
        setCategoryError('');

        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("AccessToken");
            const headers = (token && token !== "null" && token !== "undefined") ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                name: categoryFormData.name.trim(),
                description: categoryFormData.description,
                isActive: categoryFormData.isActive
            };

            const response = await axios.post(`${apiUrl}/admin/categories`, payload, { headers });

            if (response.data && (response.data.status === true || response.status === 200 || response.status === 201)) {
                showNotification(response.data.message || "Thêm danh mục mới thành công!", "success");
                setCategoryFormData({ name: '', description: '', isActive: true });
                setShowCategoryModal(false);

                // Cập nhật lại danh sách danh mục và tự chọn danh mục vừa tạo
                const updatedCategories = await fetchCategories();
                const createdCat = updatedCategories.find(
                    (cat) => {
                        const catName = cat.nameCategory || cat.name || cat.categoryName;
                        return catName?.toLowerCase() === payload.name.toLowerCase();
                    }
                );
                if (createdCat) {
                    const catId = createdCat.idCategory || createdCat.id || createdCat.categoryId || createdCat.id_category;
                    setFormData((prev) => ({ ...prev, idCategory: catId }));
                }
            } else {
                setCategoryError(response.data?.message || "Không thể tạo danh mục mới.");
                showNotification(response.data?.message || "Không thể tạo danh mục mới.", "error");
            }
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.Message || "Lỗi khi gửi dữ liệu lên server.";
            setCategoryError(errorMsg);
            showNotification(errorMsg, "error");
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.idCategory) {
            showNotification("Vui lòng chọn danh mục!", "warning");
            return;
        }

        if (!formData.name?.trim()) {
            showNotification("Vui lòng nhập tên món ăn!", "warning");
            return;
        }

        if (!formData.price || Number(formData.price) <= 0) {
            showNotification("Vui lòng nhập giá niêm yết hợp lệ (> 0)!", "warning");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('IdCategory', formData.idCategory);
        data.append('Name', formData.name.trim());
        data.append('Price', formData.price);
        data.append('Description', formData.description || '');

        if (mainImage) {
            data.append('MainImage.image', mainImage);
            data.append('MainImage.IsMain', 'true');
        }

        subImages.forEach((file, index) => {
            data.append(`ImageProduct[${index}].image`, file);
            data.append(`ImageProduct[${index}].IsMain`, 'false');
        });

        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("AccessToken");
            const headers = {
                'Content-Type': 'multipart/form-data',
                ...(token && token !== "null" && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {})
            };

            const response = await axios.post(`${apiUrl}/admin/products`, data, { headers });
            showNotification(response.data?.message || "Thêm món ăn mới thành công!", "success");
            setTimeout(() => {
                navigate('/management/menu');
            }, 1200);
        } catch (error) {
            console.error("Error creating product:", error);
            const errorData = error.response?.data;
            let errorMsg = "Lỗi khi gửi dữ liệu lên server.";

            if (errorData?.errors) {
                const validationErrors = Object.values(errorData.errors).flat().join(" | ");
                errorMsg = validationErrors || errorData.title || errorMsg;
            } else if (errorData?.message || errorData?.Message) {
                errorMsg = errorData.message || errorData.Message;
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            } else if (error.response?.status === 401) {
                errorMsg = "Phiên làm việc hết hạn. Vui lòng đăng nhập lại!";
            } else if (error.response?.status === 403) {
                errorMsg = "Bạn không có quyền quản trị để tạo sản phẩm!";
            }

            showNotification(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-container tet-theme-container">
            {/* Custom Toast Thông Báo */}
            {toast.show && (
                <div className={`custom-toast-notification ${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle2 size={22} className="toast-icon" />}
                    {toast.type === 'warning' && <AlertCircle size={22} className="toast-icon" />}
                    {toast.type === 'error' && <XCircle size={22} className="toast-icon" />}
                    <span>{toast.message}</span>
                    <button className="close-toast-btn" onClick={() => setToast({ ...toast, show: false })}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Trang trí Tết */}
            <img src={longdentetImg} alt="Lồng đèn Tết" className="tet-decor-lantern" />
            <img src={canhdaoImg} alt="Cành đào Tết" className="tet-decor-canhdao" />

            <header className="add-header tet-header">
                <button className="back-btn tet-back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} /> Quay lại
                </button>
                <div className="header-title-box">
                    <h2> Tạo Món Ăn Tết Mới</h2>
                    <span className="tet-badge"> Thực Đơn Khai Xuân Mỹ Vị</span>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="add-form-layout tet-form-layout">
                <div className="form-info-section tet-card">
                    <div className="card-header-badge">
                        <span>Thông Tin Sản Phẩm Ngày Tết</span>
                    </div>

                    <div className="input-group">
                        <label>Tên món ăn Tết <span className="required">*</span></label>
                        <input
                            name="name"
                            required
                            onChange={handleInputChange}
                            placeholder="VD: Bánh Chưng Đất Bắc, Giò Lụa Hoàng Gia..."
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <div className="label-with-action">
                                <label>Danh mục mâm cỗ <span className="required">*</span></label>
                                <button
                                    type="button"
                                    className="add-category-btn tet-add-cat-btn"
                                    onClick={() => {
                                        setCategoryError('');
                                        setShowCategoryModal(true);
                                    }}
                                >
                                    <Plus size={14} />  Thêm danh mục Tết
                                </button>
                            </div>
                            <select
                                name="idCategory"
                                required
                                value={formData.idCategory}
                                onChange={handleInputChange}
                                className="category-select tet-select"
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories && categories.length > 0 ? (
                                    categories.map((cat, index) => {
                                        const catId = cat.idCategory || cat.id || cat.categoryId || cat.id_category;
                                        const catName = cat.nameCategory || cat.name || cat.categoryName || `Danh mục #${index + 1}`;
                                        return (
                                            <option key={catId || index} value={catId || ''}>
                                                {catName}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>⚠️ Chưa có danh mục nào (Bấm "+ Thêm danh mục Tết")</option>
                                )}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Giá niêm yết (VNĐ) <span className="required">*</span></label>
                            <input name="price" type="number" required onChange={handleInputChange} placeholder="99000" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Mô tả hương vị & ý nghĩa Tết</label>
                        <textarea name="description" rows="4" onChange={handleInputChange} placeholder="Món ngon khai xuân đậm đà hương vị Tết cổ truyền..." />
                    </div>
                </div>

                <div className="form-upload-section tet-card">
                    <div className="card-header-badge">
                        <span>Hình Ảnh Món Ngon Đãi Tiệc</span>
                    </div>

                    <label className="section-title"> Ảnh đại diện chính (Banner)</label>
                    <div className="main-upload tet-upload-box">
                        {mainImage ? (
                            <div className="img-preview">
                                <img src={URL.createObjectURL(mainImage)} alt="main" />
                                <button type="button" onClick={() => setMainImage(null)}><X size={16} /></button>
                            </div>
                        ) : (
                            <label className="upload-placeholder tet-placeholder">
                                <input type="file" accept="image/*" onChange={handleMainImageChange} hidden />
                                <Upload size={32} className="upload-icon-tet" />
                                <span>Tải ảnh món ăn Tết lên</span>
                            </label>
                        )}
                    </div>

                    <label className="section-title" style={{ marginTop: '20px' }}> Ảnh bổ sung góc chụp khác</label>
                    <div className="sub-images-grid">
                        {subImages.map((file, index) => (
                            <div key={index} className="sub-img-item tet-sub-item">
                                <img src={URL.createObjectURL(file)} alt="sub" />
                                <button type="button" onClick={() => removeSubImage(index)}><X size={12} /></button>
                            </div>
                        ))}
                        <label className="add-sub-btn tet-add-sub">
                            <input type="file" multiple accept="image/*" onChange={handleSubImagesChange} hidden />
                            <Plus />
                        </label>
                    </div>

                    <button type="submit" className="submit-btn tet-submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Lưu Sản Phẩm Khai Xuân
                    </button>
                </div>
            </form>

            {/* Modal Thêm Danh Mục Mới - TET THEME */}
            {showCategoryModal && (
                <div className="modal-backdrop tet-modal-backdrop">
                    <div className="category-modal tet-modal-card">
                        <div className="modal-header tet-modal-header">
                            <div className="modal-title-tet">
                                <h3>Thêm Danh Mục Mới </h3>
                            </div>
                            <button
                                type="button"
                                className="close-modal tet-close-btn"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCategory} className="category-form">
                            <div className="input-group">
                                <label>Tên danh mới <span className="required">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    placeholder="VD: lẩu cá chép..."
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label>Mô tả danh mục</label>
                                <textarea
                                    rows="3"
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    placeholder="VD: Các món Pizza ...."
                                />
                            </div>

                            <div className="input-group checkbox-group">
                                <label className="checkbox-label tet-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={categoryFormData.isActive}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                                    />
                                    <span> Kích hoạt món</span>
                                </label>
                            </div>

                            {categoryError && (
                                <div className="modal-error-message tet-error-msg">
                                    {categoryError}
                                </div>
                            )}

                            <div className="modal-actions tet-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn tet-cancel-btn"
                                    onClick={() => setShowCategoryModal(false)}
                                    disabled={categoryLoading}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="save-cat-btn tet-save-cat-btn"
                                    disabled={categoryLoading}
                                >
                                    {categoryLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Lưu món ăn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProduct;