package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String location;
    private ApplicationStatus status;
    private String feedback;
    private LocalDateTime appliedAt;
    private Long cvId;
    private String cvTitle;
    private String resumeUrl;
    private CvResponse cv;
}
