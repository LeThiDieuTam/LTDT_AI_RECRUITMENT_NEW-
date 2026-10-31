package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String fullName;
    private String email;
    private String role; // Lưu ý: trường này là String, không phải Role enum
    private String message;
    private Long companyId;
    private String companyName;
}