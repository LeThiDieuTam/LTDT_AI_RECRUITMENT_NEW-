package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDetailResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String skills;
    private String experience;
    private String education;
    private String resumeUrl;
    private CvResponse defaultCv;
    private List<CvResponse> cvs;
    // Thêm các trường khác nếu cần thiết cho CandidateDetailResponse
    private List<ApplicationHistoryItem> applicationHistory;

    @Data
    @Builder // Added @Builder for ApplicationHistoryItem
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationHistoryItem {
        private Long applicationId;
        private String jobTitle;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
        private Long cvId;
        private String cvTitle;
        private CvResponse cv;
    }

}
