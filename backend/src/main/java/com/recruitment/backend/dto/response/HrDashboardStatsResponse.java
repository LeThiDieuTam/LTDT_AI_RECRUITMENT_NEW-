package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrDashboardStatsResponse {
    private String companyName;
    private long activeJobs;
    private long pendingJobs;
    private long expiredJobs;
    private long totalApplicants;
    private long newApplicants;
    private long reviewedApplicants;
    private long interviewedApplicants;
    private long todayNewApplicants;

    // Danh sách 5 ứng viên mới nhất để hiển thị trên dashboard
    private List<RecentApplicantItem> recentApplicants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentApplicantItem {
        private Long applicationId;
        private Long candidateId;
        private String candidateName;
        private String candidateEmail;
        private String jobTitle;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
    }
}