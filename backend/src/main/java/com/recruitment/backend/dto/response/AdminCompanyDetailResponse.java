package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Chi tiết một công ty dành cho Admin: nhân viên, tin tuyển dụng, CV gần đây.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCompanyDetailResponse {
    private AdminCompanyStatResponse company;
    private List<EmployeeItem> employees;
    private List<JobItem> jobs;
    private List<ApplicationItem> applications;
    /** Số CV nhận được theo tháng trong 6 tháng gần nhất */
    private List<AdminOverviewResponse.TimeSeriesPoint> applicationsTimeline;
    /** Phân bố hồ sơ theo trạng thái */
    private List<AdminOverviewResponse.StatusCount> statusBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeItem {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private boolean enabled;
        private LocalDateTime createdAt;
        private long jobCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobItem {
        private Long id;
        private String title;
        private String location;
        private String salary;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationItem {
        private Long applicationId;
        private Long candidateId;
        private String candidateName;
        private String candidateEmail;
        private String jobTitle;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
    }
}
