package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.CompanyRequest;
import com.recruitment.backend.dto.response.CompanyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.recruitment.backend.entity.Company; // Import Company entity

public interface CompanyService {
    // Methods for ADMIN to manage any company
    CompanyResponse create(CompanyRequest request); // For ADMIN to create any company
    CompanyResponse update(Long id, CompanyRequest request); // For ADMIN to update any company
    void delete(Long id); // For ADMIN to delete any company
    CompanyResponse getById(Long id); // For ADMIN/CANDIDATE to get any company by ID
    Page<CompanyResponse> getAll(Pageable pageable, String keyword, String city, String industry);

    // Methods for HR to manage their own company
    CompanyResponse createMyCompany(String hrEmail, CompanyRequest request); // HR creates their own company
    CompanyResponse updateMyCompany(String hrEmail, CompanyRequest request); // HR updates their own company
    CompanyResponse getMyCompany(String hrEmail); // HR gets their own company details
    Company getCompanyOfHr(String hrEmail); // Helper to get HR's company
}