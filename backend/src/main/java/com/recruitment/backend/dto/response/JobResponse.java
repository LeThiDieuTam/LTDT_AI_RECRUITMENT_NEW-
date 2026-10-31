package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private Long companyId;
    private String companyName;
    private String companyLogo; // Logo công ty để hiển thị bên phía Candidate
    private String location;
    private String salary;
    private String experience;
    private String employmentType;
    private String jobType;
    private String jobLevel; // Thêm trường này nếu chưa có
    private Job.JobStatus status;
    private LocalDateTime createdAt;
}