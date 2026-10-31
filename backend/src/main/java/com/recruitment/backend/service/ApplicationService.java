package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.ApplicationStatusUpdateRequest;
import com.recruitment.backend.dto.response.ApplicationResponse;
import com.recruitment.backend.dto.response.CvResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.ApplicationStatus;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Cv;
import com.recruitment.backend.entity.Job;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.CvRepository;
import com.recruitment.backend.repository.JobRepository;
import com.recruitment.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CompanyService companyService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CvRepository cvRepository;

    /**
     * HR cập nhật trạng thái ứng tuyển
     */
    @Transactional
    public ApplicationResponse updateApplicationStatus(String hrEmail, Long applicationId, ApplicationStatusUpdateRequest request) {
        Company hrCompany = companyService.getCompanyOfHr(hrEmail);

        Application application = applicationRepository.findByIdAndJob_Company(applicationId, hrCompany)
                .orElseThrow(() -> new EntityNotFoundException("Application not found or not associated with HR's company: " + applicationId));

        application.setStatus(request.getNewStatus());
        application.setFeedback(request.getFeedback());
        Application saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    /**
     * Ứng viên nộp đơn ứng tuyển vào một job (kèm chọn CV nếu có)
     */
    @Transactional
    public ApplicationResponse applyForJob(String candidateEmail, Long jobId, Long cvId) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Candidate not found: " + candidateEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + jobId));

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new IllegalStateException("Công việc này hiện không nhận hồ sơ ứng tuyển.");
        }

        // Kiểm tra đã ứng tuyển chưa
        if (applicationRepository.existsByCandidateAndJob_Id(candidate, jobId)) {
            throw new IllegalStateException("Bạn đã ứng tuyển vào công việc này rồi.");
        }

        // Tìm CV đính kèm
        Cv chosenCv = null;
        if (cvId != null) {
            chosenCv = cvRepository.findByIdAndCandidate(cvId, candidate).orElse(null);
        }
        if (chosenCv == null) {
            // Lấy CV mặc định
            chosenCv = cvRepository.findByCandidateAndIsDefaultTrue(candidate).orElse(null);
        }
        if (chosenCv == null) {
            // Lấy CV mới nhất nếu có
            List<Cv> cvList = cvRepository.findByCandidateOrderByUpdatedAtDesc(candidate);
            if (!cvList.isEmpty()) {
                chosenCv = cvList.get(0);
            }
        }

        Application application = Application.builder()
                .candidate(candidate)
                .job(job)
                .cv(chosenCv)
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();

        Application saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    /**
     * Overload applyForJob không truyền cvId
     */
    @Transactional
    public ApplicationResponse applyForJob(String candidateEmail, Long jobId) {
        return applyForJob(candidateEmail, jobId, null);
    }

    /**
     * Ứng viên xem danh sách ứng tuyển của mình
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(String candidateEmail) {
        List<Application> applications = applicationRepository.findByCandidateEmailWithDetails(candidateEmail);
        return applications.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Kiểm tra ứng viên đã apply job này chưa
     */
    @Transactional(readOnly = true)
    public boolean hasApplied(String candidateEmail, Long jobId) {
        User candidate = userRepository.findByEmail(candidateEmail).orElse(null);
        if (candidate == null) return false;
        return applicationRepository.existsByCandidateAndJob_Id(candidate, jobId);
    }

    private ApplicationResponse toResponse(Application app) {
        Job job = app.getJob();
        Company company = job != null ? job.getCompany() : null;
        Cv cv = app.getCv();

        CvResponse cvResponse = null;
        if (cv != null) {
            cvResponse = CvResponse.builder()
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

        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(job != null ? job.getId() : null)
                .jobTitle(job != null ? job.getTitle() : "N/A")
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogo() : null)
                .location(job != null ? job.getLocation() : null)
                .status(app.getStatus())
                .feedback(app.getFeedback())
                .appliedAt(app.getAppliedAt())
                .cvId(cv != null ? cv.getId() : null)
                .cvTitle(cv != null ? cv.getTitle() : null)
                .resumeUrl(cv != null ? cv.getResumeUrl() : null)
                .cv(cvResponse)
                .build();
    }
}