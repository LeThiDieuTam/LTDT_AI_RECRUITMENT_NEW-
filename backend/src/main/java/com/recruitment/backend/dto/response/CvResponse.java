package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvResponse {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String title;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String targetTitle;
    private String summary;
    private String skills;
    private String experience;
    private String education;
    private String certificates;
    private String resumeUrl;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
