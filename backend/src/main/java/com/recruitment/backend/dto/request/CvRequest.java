package com.recruitment.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống")
    private String title;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String targetTitle;
    private String summary;
    private String skills;
    private String experience;
    private String education;
    private String certificates;
    private String resumeUrl; // Stores template identifier (e.g. "modern", "tech", "classic", "creative") or
                              // external URL
    private Boolean isDefault;
}
