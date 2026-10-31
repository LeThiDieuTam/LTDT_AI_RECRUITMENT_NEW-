package com.recruitment.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.backend.dto.response.AiCvAnalysisResponse;
import com.recruitment.backend.dto.response.CandidateDetailResponse;
import com.recruitment.backend.dto.response.CvResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Locale;

/**
 * Service phân tích CV + đánh giá trình độ ứng viên bằng AI.
 * Gọi sang Python AI service (ai-service/matching_service.py, endpoint
 * /analyze-cv)
 * đang chạy tại http://localhost:5001.
 *
 * Nếu AI service không khả dụng -> dùng fallback phân tích cục bộ (không fail
 * request của HR).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    @Value("${app.ai-service.url:http://localhost:5001}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Cache kết quả gần nhất theo candidateId để hiển thị lại nhanh */
    private final Map<String, AiCvAnalysisResponse> lastAnalysisCache = new ConcurrentHashMap<>();

    /**
     * Phân tích CV của ứng viên (chọn CV theo cvId hoặc CV mặc định/CV đầu tiên).
     */
    public AiCvAnalysisResponse analyzeCv(CandidateDetailResponse candidate, Long cvId, String jobTitle) {
        CvResponse cv = pickCv(candidate, cvId);
        AiCvAnalysisResponse result;

        if (cv == null) {
            result = AiCvAnalysisResponse.builder()
                    .score(0)
                    .level("Chưa có CV")
                    .summary("Ứng viên chưa có CV để phân tích. Hãy yêu cầu ứng viên tạo CV trên hệ thống.")
                    .strengths(List.of())
                    .improvements(List.of())
                    .skills(List.of())
                    .recommendedKeywords(List.of())
                    .matchedSkills(List.of())
                    .missingSkills(List.of())
                    .mode("none")
                    .build();
        } else {
            result = callAiService(cv, candidate, jobTitle);
        }

        lastAnalysisCache.put(cacheKey(candidate.getId(), cvId), result);
        return result;
    }

    public AiCvAnalysisResponse getLastAnalysis(Long candidateId, Long cvId) {
        AiCvAnalysisResponse cached = lastAnalysisCache.get(cacheKey(candidateId, cvId));
        if (cached == null) {
            return AiCvAnalysisResponse.builder()
                    .score(0)
                    .level("Chưa phân tích")
                    .summary("Chưa có kết quả phân tích AI cho ứng viên này. Bấm \"Phân tích AI\" để chạy.")
                    .strengths(List.of())
                    .improvements(List.of())
                    .skills(List.of())
                    .recommendedKeywords(List.of())
                    .matchedSkills(List.of())
                    .missingSkills(List.of())
                    .mode("none")
                    .build();
        }
        return cached;
    }

    private CvResponse pickCv(CandidateDetailResponse candidate, Long cvId) {
        if (candidate.getCvs() == null || candidate.getCvs().isEmpty()) {
            return candidate.getDefaultCv();
        }
        if (cvId != null) {
            return candidate.getCvs().stream()
                    .filter(c -> c.getId().equals(cvId))
                    .findFirst()
                    .orElse(candidate.getDefaultCv());
        }
        return candidate.getDefaultCv() != null ? candidate.getDefaultCv() : candidate.getCvs().get(0);
    }

    /**
     * Gọi sang Python AI service /analyze-cv. Nếu lỗi -> fallback local.
     */
    private AiCvAnalysisResponse callAiService(CvResponse cv, CandidateDetailResponse candidate, String jobTitle) {
        try {
            Map<String, Object> payload = Map.of(
                    "cv", Map.of(
                            "title", nz(cv.getTitle()),
                            "targetTitle", nz(cv.getTargetTitle()),
                            "summary", nz(cv.getSummary()),
                            "skills", nz(cv.getSkills()),
                            "experience", nz(cv.getExperience()),
                            "education", nz(cv.getEducation()),
                            "certificates", nz(cv.getCertificates())),
                    "job", jobTitle != null ? Map.of("title", jobTitle) : Map.of());

            String raw = RestClient.create()
                    .post()
                    .uri(aiServiceUrl + "/analyze-cv")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            JsonNode json = objectMapper.readTree(raw);

            return AiCvAnalysisResponse.builder()
                    .score(json.path("score").asInt(0))
                    .level(normalizeLevel(json.path("level").asText(null)))
                    .summary(json.path("summary").asText(""))
                    .strengths(toList(json.path("strengths")))
                    .improvements(toList(json.path("improvements")))
                    .skills(toList(json.path("skills")))
                    .recommendedKeywords(toList(json.path("recommendedKeywords")))
                    .matchedSkills(toList(json.path("matchedSkills")))
                    .missingSkills(toList(json.path("missingSkills")))
                    .mode(json.path("mode").asText("openai"))
                    .notice(json.path("notice").asText(null))
                    .build();
        } catch (Exception e) {
            log.warn("AI service unavailable ({}), using local fallback", e.getMessage());
            return localFallback(cv, candidate, jobTitle, e);
        }
    }

    /**
     * Fallback: phân tích cục bộ bằng heuristic khi AI service không chạy.
     * Đánh giá trình độ dựa trên độ dài kinh nghiệm, số kỹ năng, học vấn.
     */
    private AiCvAnalysisResponse localFallback(CvResponse cv, CandidateDetailResponse candidate,
            String jobTitle, Exception error) {
        String skills = nz(cv.getSkills()).toLowerCase(Locale.ROOT);
        String experience = nz(cv.getExperience()).toLowerCase(Locale.ROOT);
        String summary = nz(cv.getSummary()).toLowerCase(Locale.ROOT);

        List<String> detected = new ArrayList<>();
        String[] knownSkills = {
                "java", "spring boot", "react", "typescript", "javascript", "node.js",
                "python", "mysql", "postgresql", "mongodb", "redis", "docker", "kubernetes",
                "git", "rest api", "graphql", "aws", "azure", "gcp", "ci/cd", "microservices",
                "html", "css", "vue.js", "angular", "c#", ".net", "php", "laravel", "sql"
        };
        for (String s : knownSkills) {
            if (skills.contains(s) || experience.contains(s) || summary.contains(s)) {
                detected.add(s.substring(0, 1).toUpperCase() + s.substring(1));
            }
        }

        // Điểm kỹ năng: 5 điểm/kỹ năng, tối đa 40
        int skillScore = Math.min(40, detected.size() * 5);
        // Điểm kinh nghiệm: dựa trên số năm có trong mô tả (tìm "x năm" / "x+ years")
        int years = extractYears(experience);
        int expScore = Math.min(35, years * 7);
        // Điểm bổ sung: có học vấn/certificate/summary
        int bonus = 0;
        if (nz(cv.getEducation()).length() > 10)
            bonus += 10;
        if (nz(cv.getCertificates()).length() > 10)
            bonus += 5;
        if (nz(cv.getSummary()).length() > 50)
            bonus += 10;

        int total = Math.min(100, skillScore + expScore + bonus);

        List<String> strengths = new ArrayList<>();
        if (!detected.isEmpty())
            strengths.add("Có " + detected.size() + " kỹ năng chuyên môn được ghi rõ trong CV");
        if (years >= 1)
            strengths.add("Kinh nghiệm khoảng " + years + "+ năm");
        if (nz(cv.getCertificates()).length() > 10)
            strengths.add("Có chứng chỉ chuyên môn");
        if (strengths.isEmpty())
            strengths.add("CV đã có thông tin cơ bản");

        List<String> improvements = new ArrayList<>();
        if (detected.size() < 5)
            improvements.add("Bổ sung thêm kỹ năng chuyên môn cụ thể (framework, công nghệ, công cụ)");
        if (years == 0)
            improvements.add("Nêu rõ số năm kinh nghiệm ở mỗi vị trí làm việc");
        if (nz(cv.getSummary()).length() < 50)
            improvements.add("Viết phần tóm tắt bản thân súc tích hơn (50-100 từ)");
        if (nz(cv.getCertificates()).length() <= 10)
            improvements.add("Thêm các chứng chỉ / giải thưởng (nếu có)");
        improvements.add("Định lượng kết quả công việc (VD: tối ưu API giảm 40% thời gian phản hồi)");

        String level;
        if (years >= 6)
            level = "Expert";
        else if (years >= 4)
            level = "Senior";
        else if (years >= 2)
            level = "Middle";
        else if (years >= 1)
            level = "Junior";
        else
            level = "Intern / Fresher";

        return AiCvAnalysisResponse.builder()
                .score(total)
                .level(level)
                .summary("Phân tích cục bộ (AI service chưa khả dụng). Ứng viên ở mức " + level
                        + " với điểm tổng " + total + "/100 dựa trên " + detected.size()
                        + " kỹ năng và khoảng " + years + " năm kinh nghiệm.")
                .strengths(strengths)
                .improvements(improvements)
                .skills(detected)
                .recommendedKeywords(List.of("Docker", "CI/CD", "Unit Testing", "Microservices", "Cloud (AWS/GCP)"))
                .matchedSkills(detected)
                .missingSkills(List.of())
                .mode("local-fallback")
                .notice("Đang dùng phân tích cục bộ vì AI service chưa khả dụng. Chạy: python ai-service/matching_service.py")
                .build();
    }

    private int extractYears(String text) {
        if (text == null || text.isBlank())
            return 0;
        // Tìm các mẫu: "3 năm", "3+ years", "5 years", "kinh nghiệm 2 năm"
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(\\d{1,2})\\s*\\+?\\s*(năm|years?|yrs?)")
                .matcher(text);
        int max = 0;
        while (m.find()) {
            try {
                max = Math.max(max, Integer.parseInt(m.group(1)));
            } catch (NumberFormatException ignored) {
            }
        }
        return max;
    }

    private String normalizeLevel(String raw) {
        if (raw == null || raw.isBlank())
            return "Chưa đánh giá";
        String lower = raw.toLowerCase(Locale.ROOT);
        if (lower.contains("expert") || lower.contains("chuyên gia"))
            return "Expert";
        if (lower.contains("senior") || lower.contains("cao cấp"))
            return "Senior";
        if (lower.contains("middle") || lower.contains("trung cấp"))
            return "Middle";
        if (lower.contains("junior") || lower.contains("sơ cấp"))
            return "Junior";
        if (lower.contains("intern") || lower.contains("thực tập"))
            return "Intern";
        return raw;
    }

    private List<String> toList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(item -> result.add(item.asText()));
        }
        return result;
    }

    private String nz(String s) {
        return s != null ? s : "";
    }

    private String cacheKey(Long candidateId, Long cvId) {
        return candidateId + ":" + (cvId == null ? "default" : cvId);
    }
}
