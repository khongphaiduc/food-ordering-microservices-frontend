import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Upload, X, Save, Loader2, Plus } from 'lucide-react';
import './AddProduct.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]); // State lưu danh sách danh mục
 const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        idCategory: '',
        name: '',
        price: '',
        description: ''
    });

    const [mainImage, setMainImage] = useState(null);
    const [subImages, setSubImages] = useState([]);

    // Fetch danh sách danh mục khi trang được load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${apiUrl}/products/category`);
                // Lưu ý: response.data.list vì payload của bạn có bọc trong object "list"
                setCategories(response.data.list || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.idCategory) {
            alert("Vui lòng chọn danh mục!");
            return;
        }
        
        setLoading(true);
        const data = new FormData();
        data.append('IdCategory', formData.idCategory);
        data.append('Name', formData.name);
        data.append('Price', formData.price);
        data.append('Description', formData.description);

        if (mainImage) {
            data.append('MainImage.image', mainImage);
            data.append('MainImage.IsMain', 'true');
        }

        subImages.forEach((file, index) => {
            data.append(`ImageProduct[${index}].image`, file);
            data.append(`ImageProduct[${index}].IsMain`, 'false');
        });

        try {
            const response = await axios.post(`${apiUrl}/admin/products`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Thêm món ăn thành công!");
            navigate('/management/menu');
        } catch (error) {
            console.error("Error:", error);
            alert("Lỗi khi gửi dữ liệu lên server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-container">
            <header className="add-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} /> Quay lại
                </button>
                <h2>Tạo Món Ăn Mới</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form-layout">
                <div className="form-info-section">
                    <div className="input-group">
                        <label>Tên món ăn</label>
                        <input name="name" required onChange={handleInputChange} placeholder="VD: Phở Bò Nam Định" />
                    </div>
                    
                    <div className="input-row">
                        <div className="input-group">
                            <label>Danh mục</label>
                            <select 
                                name="idCategory" 
                                required 
                                value={formData.idCategory} 
                                onChange={handleInputChange}
                                className="category-select"
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((cat) => (
                                    <option key={cat.idCategory} value={cat.idCategory}>
                                        {cat.nameCategory}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Giá (VNĐ)</label>
                            <input name="price" type="number" required onChange={handleInputChange} placeholder="50000" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Mô tả</label>
                        <textarea name="description" rows="4" onChange={handleInputChange} placeholder="Nội dung mô tả..." />
                    </div>
                </div>

                <div className="form-upload-section">
                    <label className="section-title">Ảnh đại diện chính</label>
                    <div className="main-upload">
                        {mainImage ? (
                            <div className="img-preview">
                                <img src={URL.createObjectURL(mainImage)} alt="main" />
                                <button type="button" onClick={() => setMainImage(null)}><X size={16} /></button>
                            </div>
                        ) : (
                            <label className="upload-placeholder">
                                <input type="file" accept="image/*" onChange={handleMainImageChange} hidden />
                                <Upload size={32} />
                                <span>Tải ảnh lên</span>
                            </label>
                        )}
                    </div>

                    <label className="section-title" style={{marginTop: '20px'}}>Ảnh bổ sung khác</label>
                    <div className="sub-images-grid">
                        {subImages.map((file, index) => (
                            <div key={index} className="sub-img-item">
                                <img src={URL.createObjectURL(file)} alt="sub" />
                                <button type="button" onClick={() => removeSubImage(index)}><X size={12} /></button>
                            </div>
                        ))}
                        <label className="add-sub-btn">
                            <input type="file" multiple accept="image/*" onChange={handleSubImagesChange} hidden />
                            <Plus />
                        </label>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Lưu Sản Phẩm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;