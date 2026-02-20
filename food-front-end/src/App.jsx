import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React from 'react';
import Home from "./components/homepage/homepage";
import ViewListProductFood from "./components/MenuFood/MenuFood";
import ProductDetail from "./components/MenuFood/ViewDetailFood";
import ShoppingCart from "./components/homepage/CartDrawer"; 
import Login from "./components/FeatureLogin/Login"; 
import Signup from "./components/FeatureLogin/Signup";
import CreateOrder from "./components/homepage/CreateOrder";
import Profile from "./components/homepage/Profile";
import OrderHistory from "./components/homepage/OrderHistory"; 

// Import Management
import ManagementLayout from "./components/Management/ManagementLayout";
import DashboardOverview from "./components/Management/Dashboard";
import MenuManagement from "./components/Management/MenuManagement"; 
import ProductDetailManagement from "./components/Management/ProductDetailManagement"; 
import AddProduct from "./components/Management/AddProduct";
// IMPORT THÊM STAFF MANAGEMENT
import StaffManagement from "./components/Management/StaffManagement"; 

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideCartPaths = ["/login", "/signup", "/confirm-menu", "/orders"];
  // Kiểm tra nếu là đường dẫn quản lý thì không hiện Giỏ hàng
  const isManagementPath = location.pathname.startsWith("/management");
  const showCart = !hideCartPaths.includes(location.pathname) && !isManagementPath;

  return (
    <>
      {showCart && <ShoppingCart />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          {/* GIAO DIỆN KHÁCH HÀNG */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/confirm-menu" element={<CreateOrder />} /> 
          <Route path="/menu" element={<ViewListProductFood />} />
          <Route path="/detail/:id" element={<ProductDetail />} />

          {/* GIAO DIỆN QUẢN LÝ */}
          <Route path="/management" element={
            <ManagementLayout><Navigate to="/management/dashboard" replace /></ManagementLayout>
          } />
          
          <Route path="/management/dashboard" element={<ManagementLayout><DashboardOverview /></ManagementLayout>} />
          <Route path="/management/menu" element={<ManagementLayout><MenuManagement /></ManagementLayout>} />
          
          {/* ROUTE QUẢN LÝ NHÂN VIÊN MỚI THÊM */}
          <Route path="/management/staff" element={<ManagementLayout><StaffManagement /></ManagementLayout>} />

          {/* Route thêm mới sản phẩm */}
          <Route path="/management/product/add" element={<ManagementLayout><AddProduct /></ManagementLayout>} />

          {/* Route sửa sản phẩm */}
          <Route path="/management/product/:id" element={<ManagementLayout><ProductDetailManagement /></ManagementLayout>} />

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;