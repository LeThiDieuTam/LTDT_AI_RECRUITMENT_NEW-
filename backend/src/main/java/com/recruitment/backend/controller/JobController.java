package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.JobRequest;
import com.recruitment.backend.dto.response.JobResponse;
import com.recruitment.backend.entity.Job;
import com.recruitment.backend.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/jobs") // Endpoint cho quản lý công việc của HR
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /**
     * Tạo một tin tuyển dụng mới cho công ty của HR hiện tại.
     * @param authentication Thông tin xác thực của HR.
     * @param jobRequest Dữ liệu tin tuyển dụng.
     * @return Tin tuyển dụng đã được tạo.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            Authentication authentication,
            @Valid @RequestBody JobRequest jobRequest) {
        JobResponse createdJob = jobService.createJob(authentication.getName(), jobRequest);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED); // Return JobResponse
    }

    /**
     * Cập nhật một tin tuyển dụng hiện có của công ty HR.
     * @param authentication Thông tin xác thực của HR.
     * @param jobId ID của tin tuyển dụng cần cập nhật.
     * @param jobRequest Dữ liệu cập nhật tin tuyển dụng.
     * @return Tin tuyển dụng đã được cập nhật.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            Authentication authentication,
            @PathVariable Long jobId,
            @Valid @RequestBody JobRequest jobRequest) {
        JobResponse updatedJob = jobService.updateJob(authentication.getName(), jobId, jobRequest);
        return ResponseEntity.ok(updatedJob); // Return JobResponse
    }

    /**
     * Xóa một tin tuyển dụng của công ty HR.
     * @param authentication Thông tin xác thực của HR.
     * @param jobId ID của tin tuyển dụng cần xóa.
     * @return ResponseEntity không có nội dung.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(
            Authentication authentication,
            @PathVariable Long jobId) {
        jobService.deleteJob(authentication.getName(), jobId); // Pass hrEmail
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách tất cả các tin tuyển dụng của công ty HR hiện tại.
     * @param authentication Thông tin xác thực của HR.
     * @return Danh sách các tin tuyển dụng.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @GetMapping
    public ResponseEntity<List<JobResponse>> getMyCompanyJobs(Authentication authentication) {
        List<JobResponse> jobs = jobService.getJobsByHrCompany(authentication.getName());
        return ResponseEntity.ok(jobs); // Return List<JobResponse>
    }

    /**
     * Lấy chi tiết một tin tuyển dụng cụ thể của công ty HR.
     * @param authentication Thông tin xác thực của HR.
     * @param jobId ID của tin tuyển dụng.
     * @return Chi tiết tin tuyển dụng.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(Authentication authentication, @PathVariable Long jobId) {
        JobResponse job = jobService.getJobByIdForHrCompany(authentication.getName(), jobId);
        return ResponseEntity.ok(job); // Return JobResponse
    }
}