import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, Upload, Loader2, X, Images, 
    CheckCircle2, Trash2, Tag, Info, DollarSign, Plus, Star
} from 'lucide-react';
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
        mainImageFile: null, // File ảnh chính mới chọn
        imagesToDelete: [],
        variantsToDelete: [] 
    });

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`https://localhost:7150/products/${id}`);
                const data = res.data;
                if (data) {
                    setProduct({
                        name: data.name || '', 
                        price: data.price || 0,
                        description: data.description || '',
                        isValiable: data.isValiable ?? true,
                        oldImages: data.productImageDTOs || [],
                        variants: data.productVariantDTOs || [], 
                        newFiles: [],
                        mainImageFile: null,
                        imagesToDelete: [],
                        variantsToDelete: []
                    });
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
                alert("Không thể tải thông tin sản phẩm!");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Xử lý chọn ảnh chính mới
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduct(prev => ({ ...prev, mainImageFile: file }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProduct(prev => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
    };

    const removeNewFile = (index) => {
        setProduct(prev => ({ ...prev, newFiles: prev.newFiles.filter((_, i) => i !== index) }));
    };

    const removeOldImage = (idImage) => {
        if (window.confirm("Xóa ảnh này khỏi hệ thống?")) {
            setProduct(prev => ({
                ...prev,
                oldImages: prev.oldImages.filter(img => img.idImage !== idImage),
                imagesToDelete: [...prev.imagesToDelete, idImage]
            }));
        }
    };

    const addVariant = () => {
        const newV = { 
            idVariant: null, 
            uiKey: `new-${Date.now()}`, 
            name: '', 
            extraPrice: 0,
            isMain: false
        };
        setProduct(prev => ({ ...prev, variants: [...prev.variants, newV] }));
    };

    const removeVariant = (item) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
            setProduct(prev => {
                const newState = { ...prev };
                if (item.idVariant) {
                    newState.variantsToDelete = [...prev.variantsToDelete, item.idVariant];
                }
                newState.variants = prev.variants.filter(v => 
                    (item.idVariant && v.idVariant !== item.idVariant) || 
                    (item.uiKey && v.uiKey !== item.uiKey)
                );
                return newState;
            });
        }
    };

    const updateVariant = (index, field, value) => {
        const updatedVariants = [...product.variants];
        updatedVariants[index][field] = value;
        setProduct({ ...product, variants: updatedVariants });
    };

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();
        
        formData.append('IdProduct', id);
        formData.append('Name', product.name);
        formData.append('Price', product.price);
        formData.append('Description', product.description);
        formData.append('IsValiable', product.isValiable);

        // --- ẢNH CHÍNH (AddMainImage) ---
        if (product.mainImageFile) {
            formData.append('AddMainImage.images', product.mainImageFile);
            formData.append('AddMainImage.IsMain', true);
        }

        // --- ẢNH PHỤ MỚI (AddnewImagesProducts) ---
        product.newFiles.forEach((file, index) => {
            formData.append(`AddnewImagesProducts[${index}].images`, file);
            formData.append(`AddnewImagesProducts[${index}].IsMain`, false);
        });

        // Xóa ảnh cũ
        product.imagesToDelete.forEach(imgId => formData.append('DeleteImage', imgId));

        // --- BIẾN THỂ ---
        const newVariants = product.variants.filter(v => !v.idVariant);
        const updateVariants = product.variants.filter(v => v.idVariant);

        newVariants.forEach((v, index) => {
            formData.append(`AddNewVariantDTOs[${index}].Name`, v.name);
            formData.append(`AddNewVariantDTOs[${index}].ExtraPrice`, v.extraPrice);
            formData.append(`AddNewVariantDTOs[${index}].IsMain`, v.isMain || false);
        });

        updateVariants.forEach((v, index) => {
            formData.append(`UpdateVariant[${index}].IdVariant`, v.idVariant);
            formData.append(`UpdateVariant[${index}].Name`, v.name);
            formData.append(`UpdateVariant[${index}].ExtraPrice`, v.extraPrice);
            formData.append(`UpdateVariant[${index}].IsMain`, v.isMain || false);
        });

        product.variantsToDelete.forEach(vId => formData.append('DeleteVariant', vId));

        try {
            await axios.put('https://localhost:7150/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Cập nhật sản phẩm thành công!");
            navigate('/management/menu');
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu dữ liệu!"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <p>Đang lấy thông tin sản phẩm...</p>
        </div>
    );

    // Tìm ảnh đang là Main từ Server
    const currentMainImage = product.oldImages.find(img => img.isMain);

    return (
        <div className="product-mgmt-page">
            <header className="page-header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <div className="header-titles">
                    <h1>Quản lý chi tiết sản phẩm</h1>
                    <p>ID: <span className="text-mono">{id}</span></p>
                </div>
            </header>

            <div className="detail-layout">
                <aside className="image-column">
                    {/* PHẦN 1: QUẢN LÝ ẢNH CHÍNH (MAIN IMAGE) */}
                    <div className="card-custom main-image-card">
                        <div className="card-header">
                            <Star size={18} className="text-orange-500 fill-orange-500" />
                            <span>Ảnh đại diện (Main Image)</span>
                        </div>
                        <div className="main-image-preview">
                            {product.mainImageFile ? (
                                <img src={URL.createObjectURL(product.mainImageFile)} alt="New Main" />
                            ) : currentMainImage ? (
                                <img src={currentMainImage.urlImage} alt="Current Main" />
                            ) : (
                                <div className="no-image-placeholder">Chưa có ảnh đại diện</div>
                            )}
                            <label className="btn-change-main">
                                <Upload size={14} /> Thay đổi ảnh chính
                                <input type="file" hidden accept="image/*" onChange={handleMainImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* PHẦN 2: QUẢN LÝ ẢNH PHỤ */}
                    <div className="card-custom">
                        <div className="card-header">
                            <Images size={18} className="text-orange-500" />
                            <span>Ảnh bổ sung (Sub Images)</span>
                        </div>
                        <div className="image-scroll-box">
                            <div className="photo-grid">
                                {product.oldImages.filter(img => !img.isMain).map((img) => (
                                    <div key={img.idImage} className="photo-item old">
                                        <img src={img.urlImage} alt="Server" />
                                        <button className="btn-del-img" onClick={() => removeOldImage(img.idImage)}>
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="badge badge-server">Đã lưu</div>
                                    </div>
                                ))}
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
                                    <span>Tải ảnh phụ</span>
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

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
                                <label><DollarSign size={14}/> Giá mặc định (đ)</label>
                                <input 
                                    type="number" 
                                    className="input-field price-input" 
                                    value={product.price} 
                                    onChange={(e) => setProduct({...product, price: e.target.value})} 
                                />
                            </div>
                            <div className="input-group">
                                <label>Trạng thái</label>
                                <select 
                                    className="input-field select-field"
                                    value={String(product.isValiable)} 
                                    onChange={(e) => setProduct({...product, isValiable: e.target.value === 'true'})}
                                >
                                    <option value="true">Đang kinh doanh</option>
                                    <option value="false">Tạm ngưng</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Mô tả món ăn</label>
                            <textarea 
                                className="input-field text-area" 
                                value={product.description} 
                                onChange={(e) => setProduct({...product, description: e.target.value})} 
                            />
                        </div>

                        <div className="variants-manager">
                            <div className="section-label-header">
                                <div className="section-label">
                                    <Tag size={18} className="text-orange-500" />
                                    <span>Tùy chọn Biến thể (Size/Topping)</span>
                                </div>
                                <button type="button" onClick={addVariant} className="btn-add-variant">
                                    <Plus size={14} /> Thêm mới
                                </button>
                            </div>

                            <div className="variant-edit-list">
                                {product.variants.map((v, index) => (
                                    <div key={v.idVariant || v.uiKey} className={`variant-edit-item ${v.idVariant ? 'is-existing' : 'is-new'}`}>
                                        <input 
                                            placeholder="Tên (VD: Size L, Thêm phô mai...)" 
                                            className="v-input-name"
                                            value={v.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                        />
                                        <div className="v-input-price-wrapper">
                                            <input 
                                                type="number" 
                                                className="v-input-price"
                                                value={v.extraPrice}
                                                onChange={(e) => updateVariant(index, 'extraPrice', e.target.value)}
                                            />
                                            <span className="unit">đ</span>
                                        </div>
                                        <button 
                                            type="button"
                                            className="btn-remove-v" 
                                            onClick={() => removeVariant(v)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {product.variants.length === 0 && <p className="empty-text">Chưa có biến thể nào.</p>}
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={saving} className="btn-save-main">
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {saving ? "Đang lưu thay đổi..." : "Cập nhật dữ liệu"}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductDetailManagement;