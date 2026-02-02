import React, { createContext, useState } from "react";

// Tạo Context
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// Provider dùng để bọc app
export const AuthProvider = ({ children }) => {
  // Khởi tạo state dựa vào token trong localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("AccessToken"); // true nếu có token, false nếu không
  });

  // Hàm login (gọi sau khi backend trả token)
  const loginfood = (accessToken, userName, idUser) => {
    localStorage.setItem("AccessToken", accessToken);       //  lưu token 
    localStorage.setItem("userName", userName);   // lưu tên thằng user 
    localStorage.setItem("idUser", idUser); 
    setIsAuthenticated(true);
  };

  // Hàm logout
  const logoutfood = () => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("idUser");
    setIsAuthenticated(false);
    removeRefreshToken ();
  };

   // lưu refresh token
  const saveRefreshToken = (Refreshtoken) => {
    localStorage.setItem("refreshToken", Refreshtoken);
  };


  //xóa refresh token 
  const removeRefreshToken = () => {
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginfood, logoutfood, saveRefreshToken, removeRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
