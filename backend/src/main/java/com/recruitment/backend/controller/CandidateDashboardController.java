package com.recruitment.backend.controller;

import com.recruitment.backend.dto.response.CandidateActivityResponse;
import com.recruitment.backend.dto.response.CandidateMetricResponse;
import com.recruitment.backend.service.CandidateDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates/dashboard")
@RequiredArgsConstructor
public class CandidateDashboardController {
    private final CandidateDashboardService service;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<List<CandidateMetricResponse>> metrics(Authentication authentication) {
        return ResponseEntity.ok(service.getMetrics(authentication.getName()));
    }

    @GetMapping("/activities")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<List<CandidateActivityResponse>> activities(Authentication authentication) {
        return ResponseEntity.ok(service.getActivities(authentication.getName()));
    }
}
