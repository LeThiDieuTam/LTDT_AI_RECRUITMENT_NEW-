package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Ứng viên (tài khoản ROLE_CANDIDATE) kèm số liệu hoạt động dành cho Admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCandidateResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String skills;
    private String experience;
    private String education;
    private String avatarUrl;
    private String resumeUrl;
    private boolean enabled;
    private LocalDateTime createdAt;

    /** Tổng số đơn ứng tuyển */
    private long applicationCount;
    /** Số CV đã tạo trong hệ thống */
    private long cvCount;
    /** Số công ty khác nhau đã ứng tuyển */
    private long companyCount;
    private LocalDateTime lastAppliedAt;
    private String lastJobTitle;
    private String lastCompanyName;
    private ApplicationStatus lastStatus;
}
