package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.CvRequest;
import com.recruitment.backend.dto.response.CvResponse;
import com.recruitment.backend.dto.response.CvTemplateResponse;
import com.recruitment.backend.service.CvService;
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
@RequestMapping("/api/cvs")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    /**
     * Lấy danh sách mẫu CV gợi ý với dữ liệu mẫu chuyên nghiệp
     */
    @GetMapping("/templates")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_HR', 'ROLE_ADMIN')")
    public ResponseEntity<List<CvTemplateResponse>> getSampleCvTemplates() {
        return ResponseEntity.ok(cvService.getSampleCvTemplates());
    }

    /**
     * Ứng viên lấy danh sách CV của chính mình
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<List<CvResponse>> getMyCvs(Authentication authentication) {
        return ResponseEntity.ok(cvService.getMyCvs(authentication.getName()));
    }

    /**
     * Xem chi tiết 1 CV (Ứng viên xem CV của mình, HR/Admin xem CV ứng viên)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_HR', 'ROLE_ADMIN')")
    public ResponseEntity<CvResponse> getCvById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(cvService.getCvById(id, authentication.getName()));
    }

    /**
     * Ứng viên tạo CV mới
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<CvResponse> createCv(
            Authentication authentication,
            @Valid @RequestBody CvRequest request) {
        CvResponse created = cvService.createCv(authentication.getName(), request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Ứng viên chỉnh sửa CV
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<CvResponse> updateCv(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CvRequest request) {
        return ResponseEntity.ok(cvService.updateCv(id, authentication.getName(), request));
    }

    /**
     * Ứng viên xóa CV
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<Map<String, String>> deleteCv(
            Authentication authentication,
            @PathVariable Long id) {
        cvService.deleteCv(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Đã xóa CV thành công"));
    }

    /**
     * Đặt CV làm mặc định
     */
    @PutMapping("/{id}/default")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<CvResponse> setDefaultCv(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(cvService.setDefaultCv(id, authentication.getName()));
    }
}
