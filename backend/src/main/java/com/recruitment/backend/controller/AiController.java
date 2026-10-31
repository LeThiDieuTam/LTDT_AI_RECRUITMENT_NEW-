package com.recruitment.backend.controller;

import com.recruitment.backend.dto.response.AiCvAnalysisResponse;
import com.recruitment.backend.dto.response.CandidateDetailResponse;
import com.recruitment.backend.service.AiAnalysisService;
import com.recruitment.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API phân tích CV bằng AI cho HR.
 * Gọi sang Python AI service (ai-service/matching_service.py) đang chạy tại http://localhost:5001.
 */
@RestController
@RequestMapping("/api/hr/candidates/{candidateId}/ai")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_HR')")
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final CandidateService candidateService;

    /**
     * AI phân tích CV mặc định (hoặc CV theo query param) + đánh giá trình độ của ứng viên.
     * Kết quả: điểm tổng (0-100), mức độ (Junior/Middle/Senior/Expert), điểm mạnh, điểm cần cải thiện,
     * kỹ năng phát hiện được, từ khóa nên thêm.
     */
    @PostMapping("/analyze-cv")
    public ResponseEntity<AiCvAnalysisResponse> analyzeCv(
            Authentication auth,
            @PathVariable Long candidateId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long cvId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String jobTitle) {
        // Đảm bảo candidate thuộc công ty của HR
        CandidateDetailResponse candidate = candidateService.getCandidateDetails(candidateId, auth.getName());
        AiCvAnalysisResponse result = aiAnalysisService.analyzeCv(candidate, cvId, jobTitle);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy kết quả phân tích gần nhất từ cache (không gọi lại AI).
     */
    @GetMapping("/analyze-cv/last")
    public ResponseEntity<AiCvAnalysisResponse> lastAnalysis(
            Authentication auth,
            @PathVariable Long candidateId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long cvId) {
        CandidateDetailResponse candidate = candidateService.getCandidateDetails(candidateId, auth.getName());
        return ResponseEntity.ok(aiAnalysisService.getLastAnalysis(candidateId, cvId));
    }
}
