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
public class CandidateListResponse {
    private Long id;
    private String fullName;
    private String email;
    private String skills;
    private String phone;
    private String latestJobTitle;
    private ApplicationStatus latestApplicationStatus;
    private LocalDateTime latestAppliedAt;
}