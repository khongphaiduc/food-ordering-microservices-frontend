import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React from 'react';
import Home from "./components/homepage/homepage";
import ViewListProductFood from "./components/MenuFood/MenuFood";
import ProductDetail from "./components/MenuFood/ViewDetailFood";
import ShoppingCart from "./components/homepage/CartDrawer"; 
import Login from "./components/FeatureLogin/Login"; 
import Signup from "./components/FeatureLogin/Signup";
import CreateOrder from "./components/homepage/CreateOrder"; 
// Import component OrderHistory mới (Bạn hãy tạo file này theo code mình gửi trước đó)
import OrderHistory from "./components/homepage/OrderHistory"; 

// Component ẩn/hiện Giỏ hàng thông minh
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Ẩn giỏ hàng ở các trang: login, signup, xác nhận hóa đơn và lịch sử đơn hàng
  const hideCartPaths = ["/login", "/signup", "/confirm-menu", "/orders"];
  const showCart = !hideCartPaths.includes(location.pathname);

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
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          
          {/* TRANG LỊCH SỬ ĐƠN HÀNG MỚI THÊM */}
          <Route path="/orders" element={<OrderHistory />} />
          
          {/* ĐƯỜNG DẪN QUAN TRỌNG: Khớp với lệnh navigate trong CartDrawer */}
          <Route path="/confirm-menu" element={<CreateOrder />} /> 
          
          <Route path="/menu" element={<ViewListProductFood />} />
          <Route path="/detail/:id" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;