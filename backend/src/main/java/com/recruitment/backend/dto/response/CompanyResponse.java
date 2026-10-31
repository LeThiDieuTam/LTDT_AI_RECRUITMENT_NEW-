package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String description;
    private String logo;
    private String coverImage; // Ảnh bìa công ty
    private String city;
    private String country;
    private String industry;
    private String companySize; // Changed from Integer to String
    private Integer foundedYear;
    private LocalDateTime createdAt;
}