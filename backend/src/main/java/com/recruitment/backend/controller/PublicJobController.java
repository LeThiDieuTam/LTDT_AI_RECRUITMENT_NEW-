package com.recruitment.backend.controller;

import com.recruitment.backend.dto.response.JobResponse;
import com.recruitment.backend.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class PublicJobController {
    private final JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            Pageable pageable) {
        if ((keyword != null && !keyword.isBlank()) || (location != null && !location.isBlank())) {
            return ResponseEntity.ok(jobService.searchJobs(keyword, location, pageable));
        }
        // Chỉ hiển thị tin OPEN trên trang công khai cho ứng viên, giống mô hình job board.
        return ResponseEntity.ok(jobService.getOpenJobs(pageable));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long jobId) {
        // Public detail endpoint is implemented by a small service method below.
        return ResponseEntity.ok(jobService.getPublicJobById(jobId));
    }
}
