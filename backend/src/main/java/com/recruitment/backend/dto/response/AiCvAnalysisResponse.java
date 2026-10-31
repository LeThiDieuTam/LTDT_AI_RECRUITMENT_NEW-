package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Kết quả AI phân tích CV + đánh giá trình độ ứng viên.
 * Trả về từ AiAnalysisService (gọi sang Python AI service hoặc fallback local).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCvAnalysisResponse {

    /** Điểm tổng 0-100 */
    private Integer score;

    /** Mức độ: Intern / Junior / Middle / Senior / Expert */
    private String level;

    /** Nhận xét tổng quan bằng tiếng Việt */
    private String summary;

    /** Điểm mạnh */
    private List<String> strengths;

    /** Điểm cần cải thiện */
    private List<String> improvements;

    /** Kỹ năng phát hiện được trong CV */
    private List<String> skills;

    /** Từ khóa nên bổ sung vào CV */
    private List<String> recommendedKeywords;

    /** Chênh lệch so với yêu cầu công việc (nếu có jobTitle) */
    private List<String> matchedSkills;

    private List<String> missingSkills;

    /** 'openai' hoặc 'local-fallback' */
    private String mode;

    private String notice;
}
