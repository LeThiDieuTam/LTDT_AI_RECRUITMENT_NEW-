package com.recruitment.backend.controller;

import com.recruitment.backend.dto.response.CandidateDetailResponse;
import com.recruitment.backend.dto.response.CandidateListResponse;
import com.recruitment.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/hr/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private static final Logger logger = LoggerFactory.getLogger(CandidateController.class);
    private final CandidateService candidateService;

    /**
     * Lấy danh sách tất cả ứng viên đã nộp đơn vào các công việc của HR hiện tại.
     * @param authentication Thông tin xác thực của HR.
     * @param searchTerm Optional search term for filtering candidates by skills, full name, or email.
     * @return Danh sách các CandidateListResponse.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @GetMapping // Endpoint để lấy danh sách ứng viên
    public List<CandidateListResponse> getAllCandidatesForHr(Authentication authentication, @RequestParam(required = false) String searchTerm) {
        logger.info("Accessing /api/hr/candidates. Authenticated user: {}", authentication.getName());
        logger.debug("User authorities: {}", authentication.getAuthorities());
        return candidateService.getAllCandidatesForHr(authentication.getName(), searchTerm);
    }
    /**
     * Lấy chi tiết hồ sơ của một ứng viên cụ thể, nếu HR hiện tại có quyền truy cập.
     * @param candidateId ID của ứng viên.
     * @param authentication Thông tin xác thực của HR.
     * @return CandidateDetailResponse chứa thông tin chi tiết của ứng viên.
     */
    @PreAuthorize("hasAuthority('ROLE_HR')")
    @GetMapping("/{candidateId}") // Endpoint để lấy chi tiết ứng viên theo ID
    public CandidateDetailResponse getCandidateDetails(@PathVariable Long candidateId, Authentication authentication) {
        logger.info("Accessing /api/hr/candidates/{}. Authenticated user: {}", candidateId, authentication.getName());
        logger.debug("User authorities: {}", authentication.getAuthorities());
        return candidateService.getCandidateDetails(candidateId, authentication.getName());
    }
}