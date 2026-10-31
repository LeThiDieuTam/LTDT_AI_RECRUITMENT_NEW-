package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Thông tin công ty kèm số liệu thống kê dành cho Admin.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCompanyStatResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String city;
    private String industry;
    private String companySize;
    private String logo;
    private String coverImage;
    private String description;
    private Integer foundedYear;
    private LocalDateTime createdAt;

    /** Tổng số nhân viên HR thuộc công ty */
    private long employeeCount;
    /** Số nhân viên HR đang hoạt động (enabled) */
    private long activeEmployeeCount;
    /** Tổng số tin tuyển dụng */
    private long jobCount;
    /** Số tin đang mở */
    private long openJobCount;
    /** Tổng số CV đã nhận */
    private long applicationCount;
    /** Số CV nhận trong 30 ngày gần nhất */
    private long applicationsLast30Days;
    /** Số ứng viên đã được tuyển */
    private long hiredCount;
}
