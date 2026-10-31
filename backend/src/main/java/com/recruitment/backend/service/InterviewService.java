package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.InterviewRequest;
import com.recruitment.backend.dto.response.InterviewResponse;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Interview;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.InterviewRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {
    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyService companyService;
    private final EmailService emailService;

    @Transactional
    public InterviewResponse create(String hrEmail, Long applicationId, InterviewRequest request) {
        Company company = companyService.getCompanyOfHr(hrEmail);
        var application = applicationRepository.findByIdAndJob_Company(applicationId, company)
                .orElseThrow(() -> new EntityNotFoundException("Application not found: " + applicationId));
        Interview interview = Interview.builder().application(application).scheduledAt(request.getScheduledAt())
                .durationMinutes(request.getDurationMinutes()).meetingUrl(request.getMeetingUrl())
                .interviewer(request.getInterviewer())
                .result(request.getResult() == null ? Interview.InterviewResult.SCHEDULED : request.getResult())
                .notes(request.getNotes()).build();
        Interview saved = interviewRepository.save(interview);

        // Gửi email mời phỏng vấn tới ứng viên (async, lỗi gửi mail không làm fail request)
        try {
            emailService.sendInterviewInvitation(application, saved, false);
        } catch (Exception e) {
            log.warn("Could not trigger interview invitation email: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse update(String hrEmail, Long interviewId, InterviewRequest request) {
        Company company = companyService.getCompanyOfHr(hrEmail);
        Interview interview = interviewRepository.findByIdAndApplication_Job_Company(interviewId, company)
                .orElseThrow(() -> new EntityNotFoundException("Interview not found: " + interviewId));
        interview.setScheduledAt(request.getScheduledAt());
        interview.setDurationMinutes(request.getDurationMinutes());
        interview.setMeetingUrl(request.getMeetingUrl());
        interview.setInterviewer(request.getInterviewer());
        if (request.getResult() != null)
            interview.setResult(request.getResult());
        interview.setNotes(request.getNotes());
        Interview saved = interviewRepository.save(interview);

        // Gửi email cập nhật / hủy lịch phỏng vấn tới ứng viên
        try {
            emailService.sendInterviewInvitation(interview.getApplication(), saved, true);
        } catch (Exception e) {
            log.warn("Could not trigger interview update email: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> list(String hrEmail, Long applicationId) {
        Company company = companyService.getCompanyOfHr(hrEmail);
        applicationRepository.findByIdAndJob_Company(applicationId, company)
                .orElseThrow(() -> new EntityNotFoundException("Application not found: " + applicationId));
        return interviewRepository.findByApplicationIdOrderByScheduledAtDesc(applicationId).stream()
                .map(this::toResponse).toList();
    }

    private InterviewResponse toResponse(Interview i) {
        return InterviewResponse.builder().id(i.getId()).scheduledAt(i.getScheduledAt())
                .durationMinutes(i.getDurationMinutes()).meetingUrl(i.getMeetingUrl()).interviewer(i.getInterviewer())
                .result(i.getResult()).notes(i.getNotes()).build();
    }
}
