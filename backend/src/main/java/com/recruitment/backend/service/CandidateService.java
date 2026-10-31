package com.recruitment.backend.service;

import com.recruitment.backend.dto.response.CandidateDetailResponse;
import com.recruitment.backend.dto.response.CandidateListResponse;
import com.recruitment.backend.dto.response.CvResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Cv;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.CvRepository;
import com.recruitment.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyService companyService;
    private final CvRepository cvRepository;

    public List<CandidateListResponse> getAllCandidatesForHr(String hrEmail, String searchTerm) {
        Company hrCompany;
        try {
            hrCompany = companyService.getCompanyOfHr(hrEmail);
        } catch (Exception e) {
            return Collections.emptyList();
        }

        if (hrCompany == null) {
            return Collections.emptyList();
        }

        // Dùng truy vấn JOIN FETCH để lấy cả Application, Candidate và Job cùng lúc
        List<Application> applications;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            applications = applicationRepository.searchByCompanyAndSearchTerm(hrCompany, searchTerm.trim());
        } else {
            applications = applicationRepository.findAllByCompanyWithCandidateAndJob(hrCompany);
        }

        if (applications.isEmpty()) {
            return Collections.emptyList();
        }

        // Nhóm theo Candidate ID để tránh lỗi so sánh entity proxy
        Map<Long, List<Application>> appsByCandidateId = applications.stream()
                .filter(app -> app.getCandidate() != null)
                .collect(Collectors.groupingBy(app -> app.getCandidate().getId()));

        return appsByCandidateId.entrySet().stream()
                .map(entry -> {
                    List<Application> candidateApps = entry.getValue();
                    User candidate = candidateApps.get(0).getCandidate();

                    // Tìm đơn ứng tuyển mới nhất
                    Application latestApp = candidateApps.stream()
                            .max(Comparator.comparing(Application::getAppliedAt))
                            .orElse(null);

                    return CandidateListResponse.builder()
                            .id(candidate.getId())
                            .fullName(candidate.getFullName())
                            .email(candidate.getEmail())
                            .phone(candidate.getPhone())
                            .skills(candidate.getSkills())
                            .latestJobTitle(latestApp != null && latestApp.getJob() != null ? latestApp.getJob().getTitle() : null)
                            .latestApplicationStatus(latestApp != null ? latestApp.getStatus() : null)
                            .latestAppliedAt(latestApp != null ? latestApp.getAppliedAt() : null)
                            .build();
                })
                .sorted(Comparator.comparing(
                        r -> r.getLatestAppliedAt() != null ? r.getLatestAppliedAt() : java.time.LocalDateTime.MIN,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    public CandidateDetailResponse getCandidateDetails(Long candidateId, String hrEmail) {
        Company hrCompany;
        try {
            hrCompany = companyService.getCompanyOfHr(hrEmail);
        } catch (Exception e) {
            throw new SecurityException("HR does not have an associated company.");
        }

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found with ID: " + candidateId));

        // Lấy toàn bộ ứng tuyển của candidate cho công ty HR kèm JOIN FETCH
        List<Application> applicationHistory = applicationRepository
                .findByCandidateAndCompanyWithDetails(candidate, hrCompany);

        if (applicationHistory.isEmpty()) {
            boolean hasAccess = applicationRepository.existsByCandidateAndJob_Company(candidate, hrCompany);
            if (!hasAccess) {
                throw new SecurityException("HR does not have access to this candidate's details.");
            }
        }

        List<CandidateDetailResponse.ApplicationHistoryItem> historyItems = applicationHistory.stream()
                .map(app -> {
                    Cv cv = app.getCv();
                    CvResponse cvRes = null;
                    if (cv != null) {
                        cvRes = CvResponse.builder()
                                .id(cv.getId())
                                .candidateId(cv.getCandidate() != null ? cv.getCandidate().getId() : null)
                                .candidateName(cv.getCandidate() != null ? cv.getCandidate().getFullName() : null)
                                .title(cv.getTitle())
                                .fullName(cv.getFullName())
                                .email(cv.getEmail())
                                .phone(cv.getPhone())
                                .address(cv.getAddress())
                                .avatarUrl(cv.getAvatarUrl())
                                .targetTitle(cv.getTargetTitle())
                                .summary(cv.getSummary())
                                .skills(cv.getSkills())
                                .experience(cv.getExperience())
                                .education(cv.getEducation())
                                .certificates(cv.getCertificates())
                                .resumeUrl(cv.getResumeUrl())
                                .isDefault(cv.isDefault())
                                .createdAt(cv.getCreatedAt())
                                .updatedAt(cv.getUpdatedAt())
                                .build();
                    }

                    return CandidateDetailResponse.ApplicationHistoryItem.builder()
                            .applicationId(app.getId())
                            .jobTitle(app.getJob() != null ? app.getJob().getTitle() : "N/A")
                            .status(app.getStatus())
                            .appliedAt(app.getAppliedAt())
                            .cvId(cv != null ? cv.getId() : null)
                            .cvTitle(cv != null ? cv.getTitle() : null)
                            .cv(cvRes)
                            .build();
                })
                .collect(Collectors.toList());

        List<Cv> candidateCvs = cvRepository.findByCandidateOrderByUpdatedAtDesc(candidate);
        List<CvResponse> cvResponses = candidateCvs.stream().map(cv -> CvResponse.builder()
                .id(cv.getId())
                .candidateId(candidate.getId())
                .candidateName(candidate.getFullName())
                .title(cv.getTitle())
                .fullName(cv.getFullName())
                .email(cv.getEmail())
                .phone(cv.getPhone())
                .address(cv.getAddress())
                .avatarUrl(cv.getAvatarUrl())
                .targetTitle(cv.getTargetTitle())
                .summary(cv.getSummary())
                .skills(cv.getSkills())
                .experience(cv.getExperience())
                .education(cv.getEducation())
                .certificates(cv.getCertificates())
                .resumeUrl(cv.getResumeUrl())
                .isDefault(cv.isDefault())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build()).collect(Collectors.toList());

        CvResponse defaultCvRes = cvResponses.stream().filter(CvResponse::isDefault).findFirst().orElse(null);

        return CandidateDetailResponse.builder()
                .id(candidate.getId())
                .fullName(candidate.getFullName())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .address(candidate.getAddress())
                .skills(candidate.getSkills())
                .experience(candidate.getExperience())
                .education(candidate.getEducation())
                .resumeUrl(candidate.getResumeUrl())
                .defaultCv(defaultCvRes)
                .cvs(cvResponses)
                .applicationHistory(historyItems)
                .build();
    }
}