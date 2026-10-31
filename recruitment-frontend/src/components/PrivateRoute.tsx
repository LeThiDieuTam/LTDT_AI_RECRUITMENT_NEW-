import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserInfo } from '../types';

interface PrivateRouteProps {
  allowedRoles?: Array<UserInfo['role']>; // Chỉ định các vai trò được phép
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('jwt_token');
  console.log('PrivateRoute: token found?', !!token); // DEBUG
  let userInfo: UserInfo | null = null;
  try {
    const storedUser = localStorage.getItem('user_info');
    console.log('PrivateRoute: storedUser from localStorage:', storedUser); // DEBUG
    if (storedUser) {
      userInfo = JSON.parse(storedUser);
      // Chuẩn hóa vai trò bằng cách loại bỏ tiền tố "ROLE_" nếu có
      if (userInfo && typeof userInfo.role === 'string') {
        userInfo.role = userInfo.role.replace(/^ROLE_/, '') as UserInfo['role'];
      }
    }
  } catch (error) {
    console.error("Lỗi khi phân tích user_info từ localStorage trong PrivateRoute:", error);
    localStorage.removeItem('user_info');
  }

  console.log('PrivateRoute: userInfo after parsing and normalization:', userInfo); // DEBUG

  if (!token) {
    // Nếu không có token, chuyển hướng đến trang đăng nhập
    console.log('PrivateRoute: No token, redirecting to /login'); // DEBUG
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userInfo && !allowedRoles.includes(userInfo.role)) {
    // Nếu người dùng đã đăng nhập nhưng không có vai trò được phép, chuyển hướng về dashboard
    console.log('PrivateRoute: User role', userInfo.role, 'not in allowed roles', allowedRoles, 'redirecting to /'); // DEBUG
    return <Navigate to="/" replace />; // Hoặc một trang "Access Denied"
  }

  return <Outlet />; // Cho phép truy cập tuyến đường con
};

export default PrivateRoute;