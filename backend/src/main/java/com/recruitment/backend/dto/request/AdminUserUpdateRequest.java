package com.recruitment.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin cập nhật thông tin tài khoản/trạng thái hoạt động của người dùng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String companySize;
    private Boolean enabled;
}
