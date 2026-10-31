package com.recruitment.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {
    @NotBlank(message = "Company name cannot be empty")
    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
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
    private String companySize;
    private Integer foundedYear;

}