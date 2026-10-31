package com.recruitment.backend.controller;

import com.recruitment.backend.dto.response.HrDashboardStatsResponse;
import com.recruitment.backend.service.HrDashboardService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/hr") 
@RequiredArgsConstructor
public class HrDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(HrDashboardController.class);
    private final HrDashboardService hrDashboardService;

    @PreAuthorize("hasAuthority('ROLE_HR')") // Đảm bảo annotation này tồn tại và chính xác
    @GetMapping("/dashboard-summary")
    public HrDashboardStatsResponse getDashboardSummary(Authentication authentication) {
        logger.info("Accessing /api/users/hr/dashboard-summary. Authenticated user: {}", authentication.getName());
        logger.debug("User authorities: {}", authentication.getAuthorities());
        return hrDashboardService.getHrDashboardStats(authentication.getName());
    }
}