package com.recruitment.backend.service.impl;

import com.recruitment.backend.dto.request.LoginRequest;
import com.recruitment.backend.entity.Role; // Import Role enum
import com.recruitment.backend.dto.request.ChangePasswordRequest;
import com.recruitment.backend.dto.request.RegisterRequest;
import com.recruitment.backend.dto.response.ApiResponse;
import com.recruitment.backend.dto.response.AuthResponse; // Sử dụng AuthResponse
import com.recruitment.backend.entity.User;
import com.recruitment.backend.exception.EmailAlreadyExistsException;
import com.recruitment.backend.exception.UserNotFoundException;
import com.recruitment.backend.repository.UserRepository;
import com.recruitment.backend.security.JwtService;
import com.recruitment.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email đã tồn tại: " + request.getEmail());
        }

        // Đảm bảo vai trò mặc định nếu không được cung cấp
        // Nếu vai trò không được cung cấp, mặc định là CANDIDATE.
        if (request.getRole() == null) {
            request.setRole(Role.CANDIDATE); // Gán vai trò mặc định là CANDIDATE
        }

        var user = User.builder()
                .fullName(request.getFullName()) // Lombok @Getter
                .email(request.getEmail()) // Lombok @Getter
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .address(request.getAddress())
                .enabled(true) // Mặc định tài khoản được kích hoạt
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user); // Corrected usage
        return AuthResponse.builder()
                .token(jwtToken) // Lombok @Getter
                .fullName(user.getFullName()) // Lombok @Getter
                .email(user.getEmail()) // Lombok @Getter
                .role(user.getRole().name()) // Chuyển đổi Role enum sang String
                .message("Đăng ký thành công.")
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .build();
    }

    @Override // Corrected method signature
    public AuthResponse authenticate(LoginRequest request) { // Changed to LoginRequest
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmailWithCompany(request.getEmail()) // Use findByEmailWithCompany
                .orElseThrow(() -> new UserNotFoundException("User not found after authentication for email: " + request.getEmail()));
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder() // Explicit builder
                .token(jwtToken)
                .fullName(user.getFullName())
                .email(user.getEmail()) // Lombok @Getter
                .role(user.getRole().name()) // Chuyển đổi Role enum sang String
                .message("Đăng nhập thành công.")
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .build();
    }

    @Override
    public ApiResponse changePassword(String userEmail, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ApiResponse.builder().success(false).message("Mật khẩu cũ không đúng.").build(); // Explicit builder
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user); // Lombok @Setter
        return ApiResponse.builder().success(true).message("Mật khẩu đã được thay đổi thành công.").build(); // Explicit builder
    }
}