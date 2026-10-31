package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.LoginRequest; // Changed to LoginRequest
import com.recruitment.backend.dto.request.RegisterRequest;
import com.recruitment.backend.dto.response.AuthResponse;

import com.recruitment.backend.dto.response.ApiResponse;

public interface AuthenticationService {

    AuthResponse register(RegisterRequest request);

    AuthResponse authenticate(LoginRequest request);

    ApiResponse changePassword(
            String userEmail, // Removed ChangePasswordRequest import
            com.recruitment.backend.dto.request.ChangePasswordRequest request
    );

}