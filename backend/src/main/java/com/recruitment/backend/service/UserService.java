package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.UserProfileUpdateRequest;
import com.recruitment.backend.dto.response.UserResponse;

public interface UserService {
    // Phương thức để lấy thông tin hồ sơ người dùng
    UserResponse getProfile(String email);
    // Phương thức để cập nhật thông tin hồ sơ người dùng
    UserResponse updateProfile(String email, UserProfileUpdateRequest request);
}