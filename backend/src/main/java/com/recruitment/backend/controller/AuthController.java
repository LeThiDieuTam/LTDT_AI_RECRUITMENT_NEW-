package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.ChangePasswordRequest;
import com.recruitment.backend.dto.request.RegisterRequest;
import com.recruitment.backend.dto.response.ApiResponse;
import com.recruitment.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.recruitment.backend.dto.response.AuthResponse; // Import AuthResponse
import com.recruitment.backend.dto.request.LoginRequest; // Corrected import

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public AuthResponse register( // Thay đổi kiểu trả về
            @RequestBody @Valid RegisterRequest request) {
        return authenticationService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody @Valid LoginRequest request) {
        return authenticationService.authenticate(request);
    }

    @PutMapping("/change-password")
    public ApiResponse changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        return authenticationService.changePassword(
                authentication.getName(),
                request
        );
    }
}