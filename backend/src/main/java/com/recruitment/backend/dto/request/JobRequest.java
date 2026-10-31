package com.recruitment.backend.dto.request;

import com.recruitment.backend.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {
    @NotBlank(message = "Tiêu đề công việc không được để trống")
    private String title;
    @NotBlank(message = "Mô tả công việc không được để trống")
    private String description;
    private Long companyId;
    @NotBlank(message = "Địa điểm không được để trống")
    private String location;
    private String salary;
    private String experience;
    private String employmentType;
    private String jobType;
    private String jobLevel; // Thêm trường này nếu chưa có
    private Job.JobStatus status;
}