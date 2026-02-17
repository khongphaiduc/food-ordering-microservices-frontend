import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, Loader2, X, Images, CheckCircle2, Trash2, Tag, Info, DollarSign } from 'lucide-react';
import './ProductDetailManagement.css';

const ProductDetailManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [product, setProduct] = useState({
        name: '', 
        price: 0, 
        description: '', 
        isValiable: true,
        oldImages: [],     
        variants: [],      
        newFiles: [],      
        imagesToDelete: [] // Danh sách chứa các Guid idImage cần xóa
    });

    // Fetch dữ liệu từ API chi tiết
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`https://localhost:7150/products/${id}`);
                const data = res.data;
                if (data) {
                    setProduct({
                        name: data.name || 'Sản phẩm đang cập nhật', 
                        price: data.price || 0,
                        description: data.description || '',
                        isValiable: data.isValiable ?? true,
                        oldImages: data.productImageDTOs || [],
                        variants: data.productVariantDTOs || [],
                        newFiles: [],
                        imagesToDelete: []
                    });
                }
            } catch (err) {
                console.error("Lỗi fetch detail:", err);
                alert("Không thể tải thông tin sản phẩm!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProduct(prev => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
    };

    const removeNewFile = (index) => {
        setProduct(prev => ({
            ...prev,
            newFiles: prev.newFiles.filter((_, i) => i !== index)
        }));
    };

    const removeOldImage = (idImage) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi hệ thống?")) {
            setProduct(prev => ({
                ...prev,
                oldImages: prev.oldImages.filter(img => img.idImage !== idImage),
                imagesToDelete: [...prev.imagesToDelete, idImage] // Đưa Guid vào mảng chờ xóa
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();
        
        // 1. Map dữ liệu cơ bản
        formData.append('IdProduct', id);
        formData.append('Name', product.name);
        formData.append('Price', product.price);
        formData.append('Description', product.description);
        formData.append('IsValiable', product.isValiable);

        // 2. Map ảnh mới thêm (AddnewImagesProducts)
        product.newFiles.forEach((file, index) => {
            formData.append(`AddnewImagesProducts[${index}].images`, file);
            formData.append(`AddnewImagesProducts[${index}].IsMain`, false);
        });

        // 3. Map danh sách GUID xóa (DeleteImage)
        if (product.imagesToDelete.length > 0) {
            product.imagesToDelete.forEach((imgId) => {
                formData.append('DeleteImage', imgId); // Append nhiều lần cùng key để Backend nhận List<Guid>
            });
        }

        try {
            await axios.put('https://localhost:7150/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Cập nhật thành công!");
            navigate('/management/menu');
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <p>Đang tải dữ liệu sản phẩm...</p>
        </div>
    );

    return (
        <div className="product-mgmt-page">
            <header className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <div className="header-titles">
                    <h1>Quản lý chi tiết</h1>
                    <p>Mã sản phẩm: <span className="text-mono">{id}</span></p>
                </div>
            </header>

            <div className="detail-layout">
                {/* CỘT TRÁI: QUẢN LÝ ALBUM */}
                <aside className="image-column">
                    <div className="card-custom">
                        <div className="card-header">
                            <Images size={18} className="text-orange-500" />
                            <span>Album hình ảnh</span>
                        </div>
                        <div className="image-scroll-box">
                            <div className="photo-grid">
                                {/* Hiển thị ảnh cũ */}
                                {product.oldImages.map((img) => (
                                    <div key={img.idImage} className="photo-item old">
                                        <img src={img.urlImage} alt="Server" />
                                        <button className="btn-del-img" onClick={() => removeOldImage(img.idImage)}>
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="badge badge-server">Đã lưu</div>
                                    </div>
                                ))}
                                {/* Hiển thị ảnh mới chọn */}
                                {product.newFiles.map((file, index) => (
                                    <div key={index} className="photo-item new">
                                        <img src={URL.createObjectURL(file)} alt="New" />
                                        <button className="btn-del-img" onClick={() => removeNewFile(index)}>
                                            <X size={12} />
                                        </button>
                                        <div className="badge badge-new">Mới</div>
                                    </div>
                                ))}
                                <label className="upload-placeholder">
                                    <Upload size={20} />
                                    <span>Tải ảnh mới</span>
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM */}
                <main className="form-column">
                    <div className="card-custom">
                        <div className="card-header">
                            <Info size={18} className="text-orange-500" />
                            <span>Thông tin cơ bản</span>
                        </div>
                        
                        <div className="input-group">
                            <label>Tên món ăn / Sản phẩm</label>
                            <input 
                                className="input-field name-input" 
                                value={product.name} 
                                onChange={(e) => setProduct({...product, name: e.target.value})} 
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label><DollarSign size={14}/> Giá niêm yết (VNĐ)</label>
                                <input 
                                    type="number" 
                                    className="input-field price-input" 
                                    value={product.price} 
                                    onChange={(e) => setProduct({...product, price: e.target.value})} 
                                />
                            </div>
                            <div className="input-group">
                                <label>Trạng thái kinh doanh</label>
                                <select 
                                    className="input-field select-field"
                                    value={String(product.isValiable)} 
                                    onChange={(e) => setProduct({...product, isValiable: e.target.value === 'true'})}
                                >
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Tạm ngưng</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Mô tả chi tiết sản phẩm</label>
                            <textarea 
                                className="input-field text-area" 
                                value={product.description} 
                                onChange={(e) => setProduct({...product, description: e.target.value})} 
                                placeholder="Nhập mô tả về sản phẩm..."
                            />
                        </div>

                        {/* HIỂN THỊ VARIANT (SIZE) */}
                        <div className="variants-box">
                            <div className="section-label">
                                <Tag size={16} />
                                <span>Phân loại & Biến thể (Size)</span>
                            </div>
                            <div className="variant-list">
                                {product.variants.length > 0 ? (
                                    product.variants.map((v) => (
                                        <div key={v.idVariant} className="v-pill">
                                            <span className="v-name">{v.name}</span>
                                            <span className="v-price">+{Number(v.extraPrice).toLocaleString()}đ</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm italic">Sản phẩm này không có biến thể.</p>
                                )}
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={saving} className="btn-save-main">
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {saving ? "Đang lưu hệ thống..." : "Xác nhận cập nhật sản phẩm"}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductDetailManagement;