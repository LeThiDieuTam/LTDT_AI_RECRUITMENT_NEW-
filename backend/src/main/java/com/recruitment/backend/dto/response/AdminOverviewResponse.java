package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dữ liệu tổng quan cho trang Admin Dashboard (số liệu + các series dùng cho
 * biểu đồ).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewResponse {

    // ===== Thẻ số liệu tổng =====
    private long totalCompanies;
    private long totalHrAccounts;
    private long totalCandidates;
    private long totalJobs;
    private long openJobs;
    private long totalApplications;
    private long todayApplications;
    private long newApplications; // Đơn mới chưa xử lý (APPLIED)
    private long hiredApplications;
    private long newCompaniesThisMonth;
    private long newCandidatesThisMonth;

    // ===== Dữ liệu biểu đồ =====
    /** Lượt nộp CV theo ngày trong 30 ngày gần nhất */
    private List<TimeSeriesPoint> applicationsTimeline;
    /** Công ty mới đăng ký theo tháng trong 6 tháng gần nhất */
    private List<TimeSeriesPoint> companyGrowthTimeline;
    /** Ứng viên mới đăng ký theo tháng trong 6 tháng gần nhất */
    private List<TimeSeriesPoint> candidateGrowthTimeline;
    /** Phân bố hồ sơ theo trạng thái */
    private List<StatusCount> applicationStatusBreakdown;
    /** Top công ty nhận nhiều CV nhất */
    private List<AdminCompanyStatResponse> topCompanies;
    /** 5 đơn ứng tuyển mới nhất */
    private List<RecentApplicationItem> recentApplications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String label;
        private long value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private ApplicationStatus status;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentApplicationItem {
        private Long applicationId;
        private Long candidateId;
        private String candidateName;
        private String candidateEmail;
        private String jobTitle;
        private String companyName;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
    }
}
