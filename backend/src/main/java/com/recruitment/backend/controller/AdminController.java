package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.AdminUserUpdateRequest;
import com.recruitment.backend.dto.request.CompanyRequest;
import com.recruitment.backend.dto.response.AdminCandidateResponse;
import com.recruitment.backend.dto.response.AdminCompanyDetailResponse;
import com.recruitment.backend.dto.response.AdminCompanyStatResponse;
import com.recruitment.backend.dto.response.AdminOverviewResponse;
import com.recruitment.backend.dto.response.CompanyResponse;
import com.recruitment.backend.dto.response.UserResponse;
import com.recruitment.backend.entity.Role;
import com.recruitment.backend.service.AdminService;
import com.recruitment.backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API dành riêng cho vai trò ADMIN: thống kê, quản lý công ty và ứng viên.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CompanyService companyService;

    // =========================================================
    // TỔNG QUAN & BIỂU ĐỒ
    // =========================================================
    @GetMapping("/dashboard")
    public AdminOverviewResponse getDashboard() {
        return adminService.getOverview();
    }

    // =========================================================
    // QUẢN LÝ CÔNG TY
    // =========================================================
    @GetMapping("/companies")
    public List<AdminCompanyStatResponse> getCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String industry) {
        return adminService.getCompanies(keyword, industry);
    }

    @GetMapping("/companies/{id}")
    public AdminCompanyDetailResponse getCompanyDetail(@PathVariable Long id) {
        return adminService.getCompanyDetail(id);
    }

    @PostMapping("/companies")
    public CompanyResponse createCompany(@RequestBody @Valid CompanyRequest request) {
        return companyService.create(request);
    }

    @PutMapping("/companies/{id}")
    public CompanyResponse updateCompany(@PathVariable Long id, @RequestBody @Valid CompanyRequest request) {
        return companyService.update(id, request);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Map<String, String>> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompany(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa công ty thành công."));
    }

    // =========================================================
    // QUẢN LÝ ỨNG VIÊN
    // =========================================================
    @GetMapping("/candidates")
    public List<AdminCandidateResponse> getCandidates(@RequestParam(required = false) String keyword) {
        return adminService.getCandidates(keyword);
    }

    @GetMapping("/candidates/{id}")
    public AdminCandidateResponse getCandidate(@PathVariable Long id) {
        return adminService.getCandidate(id);
    }

    // =========================================================
    // QUẢN LÝ TÀI KHOẢN (HR / CANDIDATE)
    // =========================================================
    @GetMapping("/users")
    public List<UserResponse> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword) {
        return adminService.getUsers(role, keyword);
    }

    @PutMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable Long id, @RequestBody AdminUserUpdateRequest request) {
        return adminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa tài khoản thành công."));
    }
}
