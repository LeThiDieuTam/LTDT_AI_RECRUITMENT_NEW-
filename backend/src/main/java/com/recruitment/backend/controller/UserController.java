package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.UserProfileUpdateRequest;
import com.recruitment.backend.dto.response.UserResponse;
import com.recruitment.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/profile") 
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại.
     * @param authentication Thông tin xác thực của người dùng.
     * @return UserResponse chứa thông tin hồ sơ.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        UserResponse userProfile = userService.getProfile(authentication.getName());
        return ResponseEntity.ok(userProfile);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserResponse updatedProfile = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(updatedProfile);
    }
}
