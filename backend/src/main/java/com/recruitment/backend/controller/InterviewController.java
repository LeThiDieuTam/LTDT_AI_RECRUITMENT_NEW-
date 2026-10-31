package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.InterviewRequest;
import com.recruitment.backend.dto.response.InterviewResponse;
import com.recruitment.backend.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr/applications/{applicationId}/interviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_HR')")
public class InterviewController {
    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> list(Authentication auth, @PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.list(auth.getName(), applicationId));
    }

    @PostMapping
    public ResponseEntity<InterviewResponse> create(Authentication auth, @PathVariable Long applicationId,
            @Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(interviewService.create(auth.getName(), applicationId, request));
    }

    @PutMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> update(Authentication auth, @PathVariable Long applicationId,
            @PathVariable Long interviewId, @Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(interviewService.update(auth.getName(), interviewId, request));
    }
}
