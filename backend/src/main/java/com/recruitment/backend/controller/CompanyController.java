package com.recruitment.backend.controller;

import com.recruitment.backend.dto.request.CompanyRequest; // Corrected import
import com.recruitment.backend.dto.request.UserProfileUpdateRequest; // Import for potential future use
import com.recruitment.backend.dto.response.CompanyResponse;
import com.recruitment.backend.service.CompanyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // =========================================================
    // ADMIN Company Management Endpoints
    // =========================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public CompanyResponse create(
            @RequestBody @Valid CompanyRequest request){
        return companyService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public CompanyResponse update(
            @PathVariable Long id,
            @RequestBody @Valid CompanyRequest request){
        return companyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public void delete(@PathVariable Long id){
        companyService.delete(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public CompanyResponse getById(@PathVariable Long id){
        return companyService.getById(id);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public Page<CompanyResponse> getAll(Pageable pageable,
                                        @RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) String city,
                                        @RequestParam(required = false) String industry){
        return companyService.getAll(pageable, keyword, city, industry);
    }

    // =========================================================
    // HR's Own Company Management Endpoints
    // = =========================================================

    /**
     * HR tạo thông tin công ty của mình (nếu chưa có).
     * @param authentication Thông tin xác thực của HR.
     * @param request Dữ liệu công ty.
     * @return Thông tin công ty đã tạo.
     */
    @PostMapping("/my-company")
    @PreAuthorize("hasAuthority('ROLE_HR')")
    public CompanyResponse createMyCompany(Authentication authentication, @RequestBody @Valid CompanyRequest request) {
        return companyService.createMyCompany(authentication.getName(), request);
    }

    /**
     * HR cập nhật thông tin công ty của mình.
     * @param authentication Thông tin xác thực của HR.
     * @param request Dữ liệu cập nhật công ty.
     * @return Thông tin công ty đã cập nhật.
     */
    @PutMapping("/my-company")
    @PreAuthorize("hasAuthority('ROLE_HR')")
    public CompanyResponse updateMyCompany(Authentication authentication, @RequestBody @Valid CompanyRequest request) {
        return companyService.updateMyCompany(authentication.getName(), request);
    }

    /**
     * HR xem thông tin công ty của mình.
     * @param authentication Thông tin xác thực của HR.
     * @return Thông tin công ty của HR.
     */
    @GetMapping("/my-company")
    @PreAuthorize("hasAuthority('ROLE_HR')")
    public CompanyResponse getMyCompany(Authentication authentication) {
        return companyService.getMyCompany(authentication.getName());
    }
}