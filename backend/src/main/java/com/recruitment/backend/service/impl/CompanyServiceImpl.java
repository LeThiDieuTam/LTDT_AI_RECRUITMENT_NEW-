package com.recruitment.backend.service.impl;

import com.recruitment.backend.dto.request.CompanyRequest;
import com.recruitment.backend.dto.response.CompanyResponse;
import com.recruitment.backend.exception.CompanyNameAlreadyExistsException;
import com.recruitment.backend.exception.CompanyNotFoundException;
import com.recruitment.backend.exception.EmailAlreadyExistsException;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.repository.CompanySpecification;
import com.recruitment.backend.entity.User; 
import com.recruitment.backend.exception.ResourceNotFoundException;
import com.recruitment.backend.repository.CompanyRepository;
import com.recruitment.backend.repository.UserRepository; 
import com.recruitment.backend.service.CompanyService;
import com.recruitment.backend.exception.UserNotFoundException; 
import com.recruitment.backend.exception.CompanyNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional

public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository; // Inject UserRepository

    @Override
    @Transactional
    public CompanyResponse create(CompanyRequest request) {

        if (companyRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Company with email " + request.getEmail() + " already exists.");
        }

        if (companyRepository.existsByName(request.getName())) {
            throw new CompanyNameAlreadyExistsException("Company with name " + request.getName() + " already exists.");
        }

        Company company = Company.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .address(request.getAddress())
                .description(request.getDescription())
                .logo(request.getLogo())
                .coverImage(request.getCoverImage())
                .city(request.getCity())
                .country(request.getCountry())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .foundedYear(request.getFoundedYear())
                // createdAt, updatedAt, and active are handled by @PrePersist in Company entity
                .build();

        company = companyRepository.save(company);

        return convertToResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse update(Long id, CompanyRequest request) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (!company.getEmail().equals(request.getEmail()) && companyRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Company with email " + request.getEmail() + " already exists.");
        }

        // Check if the new name already exists for a different company
        if (!company.getName().equals(request.getName()) && companyRepository.existsByName(request.getName())) {
            throw new CompanyNameAlreadyExistsException("Company with name " + request.getName() + " already exists.");
        }


        company.setName(request.getName());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        company.setWebsite(request.getWebsite());
        company.setAddress(request.getAddress());
        company.setDescription(request.getDescription());
        company.setLogo(request.getLogo());
        company.setCoverImage(request.getCoverImage());
        company.setCity(request.getCity());
        company.setCountry(request.getCountry());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setFoundedYear(request.getFoundedYear());
        // updatedAt is handled by @PreUpdate in Company entity
        // No need to set createdAt here as it's only on creation

        company = companyRepository.save(company);

        return convertToResponse(company);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        companyRepository.delete(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        return convertToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    // This method is for ADMINs or public access to search all companies
    public Page<CompanyResponse> getAll(Pageable pageable, String keyword, String city, String industry) {
        CompanySpecification spec = new CompanySpecification(keyword, city, industry);
        return companyRepository.findAll(spec, pageable)
                .map(this::convertToResponse);
    }

    /**
     * Convert Entity -> Response DTO
     * @param company
     * @return
     */
    private CompanyResponse convertToResponse(Company company) {

        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .email(company.getEmail())
                .phone(company.getPhone())
                .website(company.getWebsite())
                .address(company.getAddress())
                .description(company.getDescription())
                .createdAt(company.getCreatedAt())
                .logo(company.getLogo())
                .coverImage(company.getCoverImage())
                .city(company.getCity())
                .country(company.getCountry())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .foundedYear(company.getFoundedYear())
                .build();
    }

    // =========================================================
    // HR-specific Company Management Methods
    // =========================================================

    @Override
    @Transactional
    public CompanyResponse createMyCompany(String hrEmail, CompanyRequest request) {
        User hrUser = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new UserNotFoundException("HR user not found with email: " + hrEmail));

        if (hrUser.getCompany() != null) {
            throw new IllegalStateException("HR user is already associated with a company. Use updateMyCompany instead.");
        }

        if (companyRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Company with email " + request.getEmail() + " already exists.");
        }

        if (companyRepository.existsByName(request.getName())) {
            throw new CompanyNameAlreadyExistsException("Company with name " + request.getName() + " already exists.");
        }

        Company company = Company.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .address(request.getAddress())
                .description(request.getDescription())
                .logo(request.getLogo())
                .coverImage(request.getCoverImage())
                .city(request.getCity())
                .country(request.getCountry())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .foundedYear(request.getFoundedYear())
                .build();

        company = companyRepository.save(company);
        hrUser.setCompany(company); // Associate the new company with the HR user
        userRepository.save(hrUser); // Save the updated HR user

        return convertToResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse updateMyCompany(String hrEmail, CompanyRequest request) {
        Company hrCompany = getCompanyOfHr(hrEmail); // Get the HR's associated company

        // Ensure the request's email matches the HR's company email, or handle potential email change
        if (!hrCompany.getEmail().equals(request.getEmail()) && companyRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Company with email " + request.getEmail() + " already exists.");
        }

        // Check if the new name already exists for a different company
        if (!hrCompany.getName().equals(request.getName()) && companyRepository.existsByName(request.getName())) {
            throw new CompanyNameAlreadyExistsException("Company with name " + request.getName() + " already exists.");
        }

        hrCompany.setName(request.getName());
        hrCompany.setEmail(request.getEmail());
        hrCompany.setPhone(request.getPhone());
        hrCompany.setWebsite(request.getWebsite());
        hrCompany.setAddress(request.getAddress());
        hrCompany.setDescription(request.getDescription());
        hrCompany.setLogo(request.getLogo());
        hrCompany.setCoverImage(request.getCoverImage());
        hrCompany.setCity(request.getCity());
        hrCompany.setCountry(request.getCountry());
        hrCompany.setIndustry(request.getIndustry());
        hrCompany.setCompanySize(request.getCompanySize());
        hrCompany.setFoundedYear(request.getFoundedYear());

        Company updatedCompany = companyRepository.save(hrCompany);
        return convertToResponse(updatedCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getMyCompany(String hrEmail) {
        Company hrCompany = getCompanyOfHr(hrEmail);
        return convertToResponse(hrCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public Company getCompanyOfHr(String hrEmail) {
        User hrUser = userRepository.findByEmailWithCompany(hrEmail)
                .orElseThrow(() -> new UserNotFoundException("HR user not found with email: " + hrEmail));
        if (hrUser.getCompany() == null) {
            throw new CompanyNotFoundException("HR user is not associated with any company.");
        }
        return hrUser.getCompany();
    }
}
