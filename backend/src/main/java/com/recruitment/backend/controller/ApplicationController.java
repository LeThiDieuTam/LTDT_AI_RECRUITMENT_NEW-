package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.ApplicationStatusUpdateRequest;
import com.recruitment.backend.dto.request.ApplyJobRequest;
import com.recruitment.backend.dto.response.ApplicationResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * HR: Cập nhật trạng thái ứng tuyển
     * PUT /api/hr/applications/{applicationId}/status
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @PutMapping("/api/hr/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            Authentication authentication,
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicationResponse updatedApplication = applicationService.updateApplicationStatus(authentication.getName(), applicationId, request);
        return ResponseEntity.ok(updatedApplication);
    }

    /**
     * CANDIDATE: Nộp đơn ứng tuyển vào job (có thể chọn kèm CV)
     * POST /api/jobs/{jobId}/apply
     */
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    @PostMapping("/api/jobs/{jobId}/apply")
    public ResponseEntity<?> applyForJob(
            Authentication authentication,
            @PathVariable Long jobId,
            @RequestBody(required = false) ApplyJobRequest request) {
        try {
            Long cvId = request != null ? request.getCvId() : null;
            ApplicationResponse response = applicationService.applyForJob(authentication.getName(), jobId, cvId);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * CANDIDATE: Xem danh sách ứng tuyển của mình
     * GET /api/candidates/my-applications
     */
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    @GetMapping("/api/candidates/my-applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication authentication) {
        List<ApplicationResponse> applications = applicationService.getMyApplications(authentication.getName());
        return ResponseEntity.ok(applications);
    }

    /**
     * CANDIDATE: Kiểm tra đã ứng tuyển job này chưa
     * GET /api/jobs/{jobId}/applied
     */
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    @GetMapping("/api/jobs/{jobId}/applied")
    public ResponseEntity<Map<String, Boolean>> hasApplied(
            Authentication authentication,
            @PathVariable Long jobId) {
        boolean applied = applicationService.hasApplied(authentication.getName(), jobId);
        return ResponseEntity.ok(Map.of("applied", applied));
    }
}