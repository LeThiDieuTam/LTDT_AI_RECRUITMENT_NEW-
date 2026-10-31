package com.recruitment.backend.service;

import com.recruitment.backend.dto.response.HrDashboardStatsResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.ApplicationStatus;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Job;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HrDashboardService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyService companyService;

    public HrDashboardStatsResponse getHrDashboardStats(String hrEmail) {
        Company hrCompany;
        try {
            hrCompany = companyService.getCompanyOfHr(hrEmail);
        } catch (Exception e) {
            return HrDashboardStatsResponse.builder()
                    .companyName("Công ty của bạn")
                    .activeJobs(0)
                    .pendingJobs(0)
                    .expiredJobs(0)
                    .totalApplicants(0)
                    .newApplicants(0)
                    .reviewedApplicants(0)
                    .interviewedApplicants(0)
                    .todayNewApplicants(0)
                    .recentApplicants(Collections.emptyList())
                    .build();
        }

        if (hrCompany == null) {
            return HrDashboardStatsResponse.builder()
                    .companyName("Công ty của bạn")
                    .activeJobs(0)
                    .pendingJobs(0)
                    .expiredJobs(0)
                    .totalApplicants(0)
                    .newApplicants(0)
                    .reviewedApplicants(0)
                    .interviewedApplicants(0)
                    .todayNewApplicants(0)
                    .recentApplicants(Collections.emptyList())
                    .build();
        }

        String companyName = hrCompany.getName();
        if (companyName == null || companyName.trim().isEmpty()) {
            companyName = "Công ty của bạn";
        }

        // 1. Thống kê tin tuyển dụng
        long activeJobs = jobRepository.countByCompanyAndStatus(hrCompany, Job.JobStatus.OPEN);
        long pendingJobs = jobRepository.countByCompanyAndStatus(hrCompany, Job.JobStatus.DRAFT);

        // 2. Thống kê ứng viên
        long totalApplicants = applicationRepository.countByJob_Company(hrCompany);
        long newApplicants = applicationRepository.countByJob_CompanyAndStatus(hrCompany, ApplicationStatus.APPLIED);
        long reviewedApplicants = applicationRepository.countByJob_CompanyAndStatus(hrCompany, ApplicationStatus.REVIEWING);
        long interviewedApplicants = applicationRepository.countByJob_CompanyAndStatus(hrCompany, ApplicationStatus.INTERVIEWED);

        // 3. Ứng viên mới hôm nay
        LocalDateTime startOfToday = LocalDateTime.now()
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        long todayNewApplicants = applicationRepository.countByJob_CompanyAndAppliedAtAfter(hrCompany, startOfToday);

        // 4. 5 ứng viên mới nhất (lấy qua JOIN FETCH để an toàn)
        List<Application> recentApps = applicationRepository.findRecentByCompany(hrCompany);
        List<HrDashboardStatsResponse.RecentApplicantItem> recentApplicants = recentApps.stream()
                .limit(5)
                .map(app -> HrDashboardStatsResponse.RecentApplicantItem.builder()
                        .applicationId(app.getId())
                        .candidateId(app.getCandidate() != null ? app.getCandidate().getId() : null)
                        .candidateName(app.getCandidate() != null ? app.getCandidate().getFullName() : "N/A")
                        .candidateEmail(app.getCandidate() != null ? app.getCandidate().getEmail() : "N/A")
                        .jobTitle(app.getJob() != null ? app.getJob().getTitle() : "N/A")
                        .status(app.getStatus())
                        .appliedAt(app.getAppliedAt())
                        .build())
                .collect(Collectors.toList());

        return HrDashboardStatsResponse.builder()
                .companyName(companyName)
                .activeJobs(activeJobs)
                .pendingJobs(pendingJobs)
                .expiredJobs(0)
                .totalApplicants(totalApplicants)
                .newApplicants(newApplicants)
                .reviewedApplicants(reviewedApplicants)
                .interviewedApplicants(interviewedApplicants)
                .todayNewApplicants(todayNewApplicants)
                .recentApplicants(recentApplicants)
                .build();
    }
}