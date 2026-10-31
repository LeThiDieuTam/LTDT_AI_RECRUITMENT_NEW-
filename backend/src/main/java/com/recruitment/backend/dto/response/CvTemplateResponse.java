package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvTemplateResponse {
    private String templateId; // e.g. "modern", "classic", "creative", "tech", "minimalist"
    private String templateName; // e.g. "Mẫu Hiện Đại (Modern Navy)"
    private String category; // e.g. "IT & Lập trình", "Marketing & Kinh doanh"
    private String description;
    private String previewColor; // Hex code color e.g. "#1e40af"
    private String sampleTitle;
    private String sampleFullName;
    private String sampleEmail;
    private String samplePhone;
    private String sampleAddress;
    private String sampleAvatarUrl;
    private String sampleTargetTitle;
    private String sampleSummary;
    private String sampleSkills;
    private String sampleExperience;
    private String sampleEducation;
    private String sampleCertificates;
}
