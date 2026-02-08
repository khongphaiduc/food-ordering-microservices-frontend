import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./components/homepage/home.css";
import Home from "./components/homepage/homepage";
import ViewListProductFood from "./components/MenuFood/MenuFood";
import ProductDetail from "./components/MenuFood/ViewDetailFood";
import ShoppingCart from "./components/homepage/CartDrawer"; 
import Login from "./components/FeatureLogin/Login"; // 1. Import trang Login của bạn
import Signup from "./components/FeatureLogin/Signup";
// Component phụ trợ để kiểm soát việc hiển thị ShoppingCart
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Không hiển thị giỏ hàng nếu đang ở trang login
  const showCart = location.pathname !== "/login";

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
      {/* 2. Bọc Routes trong LayoutWrapper để ẩn/hiện Giỏ hàng thông minh */}
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* 3. Route đăng nhập */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/menu" element={<ViewListProductFood />} />
          <Route path="/detail/:id" element={<ProductDetail />} />
          
          {/* Redirect các path lạ về home */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;