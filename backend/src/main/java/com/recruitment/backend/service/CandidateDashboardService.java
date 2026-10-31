package com.recruitment.backend.service;

import com.recruitment.backend.dto.response.CandidateActivityResponse;
import com.recruitment.backend.dto.response.CandidateMetricResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.ApplicationStatus;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateDashboardService {
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    private User getCandidate(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Candidate not found: " + email));
    }

    @Transactional(readOnly = true)
    public List<CandidateMetricResponse> getMetrics(String email) {
        User candidate = getCandidate(email);
        List<Application> apps = applicationRepository.findByCandidate(candidate);
        long total = apps.size();
        long reviewing = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.REVIEWING).count();
        long interviewed = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEWED).count();
        long hired = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.HIRED).count();
        return List.of(
                CandidateMetricResponse.builder().label("Tổng số ứng tuyển").value(String.valueOf(total)).description("Tổng số hồ sơ đã ứng tuyển").progress(100).build(),
                CandidateMetricResponse.builder().label("Đang chờ duyệt").value(String.valueOf(reviewing)).description("Hồ sơ đang được xem xét").progress(total == 0 ? 0 : (int)(reviewing * 100 / total)).build(),
                CandidateMetricResponse.builder().label("Đã phỏng vấn").value(String.valueOf(interviewed)).description("Hồ sơ đã đến vòng phỏng vấn").progress(total == 0 ? 0 : (int)(interviewed * 100 / total)).build(),
                CandidateMetricResponse.builder().label("Đã được nhận").value(String.valueOf(hired)).description("Hồ sơ đã được tuyển dụng").progress(total == 0 ? 0 : (int)(hired * 100 / total)).build()
        );
    }

    @Transactional(readOnly = true)
    public List<CandidateActivityResponse> getActivities(String email) {
        User candidate = getCandidate(email);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return applicationRepository.findByCandidateOrderByAppliedAtDesc(candidate).stream()
                .limit(10)
                .map(a -> CandidateActivityResponse.builder()
                        .id(a.getId()).type(a.getStatus().name())
                        .description("Ứng tuyển: " + a.getJob().getTitle())
                        .time(a.getAppliedAt().format(formatter)).build())
                .toList();
    }
}
