package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.AdminUserUpdateRequest;
import com.recruitment.backend.dto.response.AdminCandidateResponse;
import com.recruitment.backend.dto.response.AdminCompanyDetailResponse;
import com.recruitment.backend.dto.response.AdminCompanyStatResponse;
import com.recruitment.backend.dto.response.AdminOverviewResponse;
import com.recruitment.backend.dto.response.UserResponse;
import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.ApplicationStatus;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Job;
import com.recruitment.backend.entity.Role;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.exception.CompanyNotFoundException;
import com.recruitment.backend.exception.UserNotFoundException;
import com.recruitment.backend.repository.ApplicationRepository;
import com.recruitment.backend.repository.CompanyRepository;
import com.recruitment.backend.repository.CvRepository;
import com.recruitment.backend.repository.JobRepository;
import com.recruitment.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service tổng hợp dữ liệu cho khu vực quản trị (ADMIN):
 * thống kê toàn hệ thống, quản lý công ty, quản lý ứng viên.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

        private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("dd/MM");
        private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

        private final UserRepository userRepository;
        private final CompanyRepository companyRepository;
        private final JobRepository jobRepository;
        private final ApplicationRepository applicationRepository;
        private final CvRepository cvRepository;

        // =========================================================
        // 1. TỔNG QUAN + BIỂU ĐỒ
        // =========================================================
        public AdminOverviewResponse getOverview() {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
                LocalDateTime last30Days = now.minusDays(30);
                LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();

                long totalCandidates = userRepository.countByRole(Role.CANDIDATE);
                long totalHrAccounts = userRepository.countByRole(Role.HR);

                // --- Đếm hồ sơ theo trạng thái ---
                Map<ApplicationStatus, Long> statusMap = new HashMap<>();
                for (Object[] row : applicationRepository.countGroupByStatus()) {
                        statusMap.put((ApplicationStatus) row[0], ((Number) row[1]).longValue());
                }

                // --- Lượt nộp CV theo ngày (30 ngày gần nhất) ---
                List<AdminOverviewResponse.TimeSeriesPoint> applicationsTimeline = buildDailyTimeline(30);

                // --- Công ty mới theo tháng (6 tháng) ---
                List<AdminOverviewResponse.TimeSeriesPoint> companyGrowth = buildMonthlyTimeline(
                                6,
                                companyRepository.findAll().stream()
                                                .map(Company::getCreatedAt)
                                                .filter(java.util.Objects::nonNull)
                                                .collect(Collectors.toList()));

                // --- Ứng viên mới theo tháng (6 tháng) ---
                List<AdminOverviewResponse.TimeSeriesPoint> candidateGrowth = buildMonthlyTimeline(
                                6,
                                userRepository.searchByRole(Role.CANDIDATE, "", Pageable.unpaged())
                                                .getContent().stream()
                                                .map(User::getCreatedAt)
                                                .filter(java.util.Objects::nonNull)
                                                .collect(Collectors.toList()));

                // --- Top công ty nhận nhiều CV ---
                List<AdminCompanyStatResponse> allCompanies = buildCompanyStats();
                List<AdminCompanyStatResponse> topCompanies = allCompanies.stream()
                                .sorted(Comparator.comparingLong(AdminCompanyStatResponse::getApplicationCount)
                                                .reversed())
                                .limit(5)
                                .collect(Collectors.toList());

                // --- 5 đơn mới nhất ---
                Pageable top5 = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "appliedAt"));
                List<AdminOverviewResponse.RecentApplicationItem> recent = applicationRepository
                                .findAllWithCandidateAndJob(top5)
                                .getContent()
                                .stream()
                                .map(this::toRecentItem)
                                .collect(Collectors.toList());

                List<AdminOverviewResponse.StatusCount> statusBreakdown = new ArrayList<>();
                for (ApplicationStatus status : ApplicationStatus.values()) {
                        statusBreakdown.add(AdminOverviewResponse.StatusCount.builder()
                                        .status(status)
                                        .count(statusMap.getOrDefault(status, 0L))
                                        .build());
                }

                return AdminOverviewResponse.builder()
                                .totalCompanies(companyRepository.count())
                                .totalHrAccounts(totalHrAccounts)
                                .totalCandidates(totalCandidates)
                                .totalJobs(jobRepository.count())
                                .openJobs(jobRepository.countByStatus(Job.JobStatus.OPEN))
                                .totalApplications(applicationRepository.count())
                                .todayApplications(applicationRepository.countByAppliedAtAfter(startOfToday))
                                .newApplications(applicationRepository.countByStatus(ApplicationStatus.APPLIED))
                                .hiredApplications(applicationRepository.countByStatus(ApplicationStatus.HIRED))
                                .newCompaniesThisMonth(companyRepository.countByCreatedAtAfter(startOfMonth))
                                .newCandidatesThisMonth(userRepository.countByCreatedAtAfter(startOfMonth))
                                .applicationsTimeline(applicationsTimeline)
                                .companyGrowthTimeline(companyGrowth)
                                .candidateGrowthTimeline(candidateGrowth)
                                .applicationStatusBreakdown(statusBreakdown)
                                .topCompanies(topCompanies)
                                .recentApplications(recent)
                                .build();
        }

        // =========================================================
        // 2. QUẢN LÝ CÔNG TY
        // =========================================================
        public List<AdminCompanyStatResponse> getCompanies(String keyword, String industry) {
                List<AdminCompanyStatResponse> companies = buildCompanyStats();
                String kw = keyword == null ? "" : keyword.trim().toLowerCase();
                String ind = industry == null ? "" : industry.trim();

                return companies.stream()
                                .filter(c -> {
                                        boolean matchKeyword = kw.isEmpty()
                                                        || contains(c.getName(), kw)
                                                        || contains(c.getEmail(), kw)
                                                        || contains(c.getCity(), kw)
                                                        || contains(c.getIndustry(), kw);
                                        boolean matchIndustry = ind.isEmpty() || ind.equalsIgnoreCase(c.getIndustry());
                                        return matchKeyword && matchIndustry;
                                })
                                .sorted(Comparator.comparingLong(AdminCompanyStatResponse::getApplicationCount)
                                                .reversed())
                                .collect(Collectors.toList());
        }

        public AdminCompanyDetailResponse getCompanyDetail(Long companyId) {
                Company company = companyRepository.findById(companyId)
                                .orElseThrow(() -> new CompanyNotFoundException(
                                                "Không tìm thấy công ty với ID: " + companyId));

                AdminCompanyStatResponse stat = buildCompanyStats().stream()
                                .filter(s -> s.getId().equals(companyId))
                                .findFirst()
                                .orElse(toCompanyStat(company));

                // --- Nhân viên HR của công ty ---
                List<User> employees = userRepository.searchByRole(Role.HR, "", Pageable.unpaged())
                                .getContent()
                                .stream()
                                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                                .collect(Collectors.toList());

                List<Job> jobs = jobRepository.findByCompany(company);
                long jobCount = jobs.size();

                List<AdminCompanyDetailResponse.EmployeeItem> employeeItems = employees.stream()
                                .map(u -> AdminCompanyDetailResponse.EmployeeItem.builder()
                                                .id(u.getId())
                                                .fullName(u.getFullName())
                                                .email(u.getEmail())
                                                .phone(u.getPhone())
                                                .avatarUrl(u.getAvatarUrl())
                                                .enabled(u.isEnabled())
                                                .createdAt(u.getCreatedAt())
                                                .jobCount(jobCount)
                                                .build())
                                .collect(Collectors.toList());

                List<AdminCompanyDetailResponse.JobItem> jobItems = jobs.stream()
                                .sorted(Comparator.comparing(Job::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .map(j -> AdminCompanyDetailResponse.JobItem.builder()
                                                .id(j.getId())
                                                .title(j.getTitle())
                                                .location(j.getLocation())
                                                .salary(j.getSalary())
                                                .status(j.getStatus() != null ? j.getStatus().name() : null)
                                                .createdAt(j.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());

                List<Application> applications = applicationRepository.findAllByCompanyOrderByAppliedAtDesc(company);

                List<AdminCompanyDetailResponse.ApplicationItem> applicationItems = applications.stream()
                                .limit(50)
                                .map(a -> AdminCompanyDetailResponse.ApplicationItem.builder()
                                                .applicationId(a.getId())
                                                .candidateId(a.getCandidate() != null ? a.getCandidate().getId() : null)
                                                .candidateName(a.getCandidate() != null ? a.getCandidate().getFullName()
                                                                : "N/A")
                                                .candidateEmail(a.getCandidate() != null ? a.getCandidate().getEmail()
                                                                : "N/A")
                                                .jobTitle(a.getJob() != null ? a.getJob().getTitle() : "N/A")
                                                .status(a.getStatus())
                                                .appliedAt(a.getAppliedAt())
                                                .build())
                                .collect(Collectors.toList());

                // --- Timeline 6 tháng gần nhất ---
                List<AdminOverviewResponse.TimeSeriesPoint> timeline = buildMonthlyTimeline(
                                6,
                                applications.stream().map(Application::getAppliedAt).filter(java.util.Objects::nonNull)
                                                .collect(Collectors.toList()));

                Map<ApplicationStatus, Long> statusMap = new HashMap<>();
                for (Application app : applications) {
                        statusMap.merge(app.getStatus(), 1L, Long::sum);
                }
                List<AdminOverviewResponse.StatusCount> statusBreakdown = new ArrayList<>();
                for (ApplicationStatus status : ApplicationStatus.values()) {
                        statusBreakdown.add(AdminOverviewResponse.StatusCount.builder()
                                        .status(status)
                                        .count(statusMap.getOrDefault(status, 0L))
                                        .build());
                }

                return AdminCompanyDetailResponse.builder()
                                .company(stat)
                                .employees(employeeItems)
                                .jobs(jobItems)
                                .applications(applicationItems)
                                .applicationsTimeline(timeline)
                                .statusBreakdown(statusBreakdown)
                                .build();
        }

        @Transactional
        public void deleteCompany(Long companyId) {
                Company company = companyRepository.findById(companyId)
                                .orElseThrow(() -> new CompanyNotFoundException(
                                                "Không tìm thấy công ty với ID: " + companyId));
                companyRepository.delete(company);
        }

        // =========================================================
        // 3. QUẢN LÝ ỨNG VIÊN
        // =========================================================
        public List<AdminCandidateResponse> getCandidates(String keyword) {
                String kw = keyword == null ? "" : keyword.trim().toLowerCase();

                List<Application> allApplications = applicationRepository
                                .findAll(Sort.by(Sort.Direction.DESC, "appliedAt"));

                // Gom đơn theo candidate
                Map<Long, List<Application>> appsByCandidate = allApplications.stream()
                                .filter(a -> a.getCandidate() != null)
                                .collect(Collectors.groupingBy(a -> a.getCandidate().getId()));

                List<User> candidates = userRepository.searchByRole(Role.CANDIDATE, "", Pageable.unpaged())
                                .getContent();

                Map<Long, Long> cvCounts = toCountMap(cvRepository.countGroupByCandidate());

                List<AdminCandidateResponse> result = candidates.stream()
                                .map(candidate -> {
                                        List<Application> apps = appsByCandidate.getOrDefault(candidate.getId(),
                                                        List.of());
                                        Application last = apps.stream()
                                                        .max(Comparator.comparing(Application::getAppliedAt,
                                                                        Comparator.nullsFirst(
                                                                                        Comparator.naturalOrder())))
                                                        .orElse(null);

                                        long distinctCompanies = apps.stream()
                                                        .filter(a -> a.getJob() != null
                                                                        && a.getJob().getCompany() != null)
                                                        .map(a -> a.getJob().getCompany().getId())
                                                        .distinct()
                                                        .count();

                                        return AdminCandidateResponse.builder()
                                                        .id(candidate.getId())
                                                        .fullName(candidate.getFullName())
                                                        .email(candidate.getEmail())
                                                        .phone(candidate.getPhone())
                                                        .address(candidate.getAddress())
                                                        .skills(candidate.getSkills())
                                                        .experience(candidate.getExperience())
                                                        .education(candidate.getEducation())
                                                        .avatarUrl(candidate.getAvatarUrl())
                                                        .resumeUrl(candidate.getResumeUrl())
                                                        .enabled(candidate.isEnabled())
                                                        .createdAt(candidate.getCreatedAt())
                                                        .applicationCount(apps.size())
                                                        .cvCount(cvCounts.getOrDefault(candidate.getId(), 0L))
                                                        .companyCount(distinctCompanies)
                                                        .lastAppliedAt(last != null ? last.getAppliedAt() : null)
                                                        .lastJobTitle(last != null && last.getJob() != null
                                                                        ? last.getJob().getTitle()
                                                                        : null)
                                                        .lastCompanyName(last != null && last.getJob() != null
                                                                        && last.getJob().getCompany() != null
                                                                                        ? last.getJob().getCompany()
                                                                                                        .getName()
                                                                                        : null)
                                                        .lastStatus(last != null ? last.getStatus() : null)
                                                        .build();
                                })
                                .filter(c -> kw.isEmpty()
                                                || contains(c.getFullName(), kw)
                                                || contains(c.getEmail(), kw)
                                                || contains(c.getPhone(), kw)
                                                || contains(c.getSkills(), kw)
                                                || contains(c.getLastCompanyName(), kw))
                                .sorted(Comparator.comparing(AdminCandidateResponse::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .collect(Collectors.toList());

                return result;
        }

        public AdminCandidateResponse getCandidate(Long candidateId) {
                return getCandidates(null).stream()
                                .filter(c -> c.getId().equals(candidateId))
                                .findFirst()
                                .orElseThrow(() -> new UserNotFoundException(
                                                "Không tìm thấy ứng viên với ID: " + candidateId));
        }

        // =========================================================
        // 4. QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
        // =========================================================
        public List<UserResponse> getUsers(Role role, String keyword) {
                Role targetRole = role != null ? role : Role.HR;
                String kw = keyword == null ? "" : keyword.trim();
                return userRepository.searchByRole(targetRole, kw, Pageable.unpaged())
                                .getContent()
                                .stream()
                                .map(this::toUserResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public UserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "Không tìm thấy người dùng với ID: " + userId));

                if (request.getFullName() != null && !request.getFullName().isBlank()) {
                        user.setFullName(request.getFullName().trim());
                }
                if (request.getEmail() != null && !request.getEmail().isBlank()
                                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                        if (userRepository.existsByEmail(request.getEmail().trim())) {
                                throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
                        }
                        user.setEmail(request.getEmail().trim());
                }
                if (request.getPhone() != null) {
                        user.setPhone(request.getPhone());
                }
                if (request.getAddress() != null) {
                        user.setAddress(request.getAddress());
                }
                if (request.getEnabled() != null) {
                        if (user.getRole() == Role.ADMIN && !request.getEnabled()) {
                                throw new IllegalArgumentException("Không thể khóa tài khoản quản trị viên.");
                        }
                        user.setEnabled(request.getEnabled());
                }
                if (request.getCompanySize() != null && user.getCompany() != null) {
                        Company company = user.getCompany();
                        company.setCompanySize(request.getCompanySize());
                        companyRepository.save(company);
                }

                return toUserResponse(userRepository.save(user));
        }

        @Transactional
        public void deleteUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "Không tìm thấy người dùng với ID: " + userId));
                if (user.getRole() == Role.ADMIN) {
                        throw new IllegalArgumentException("Không thể xóa tài khoản quản trị viên.");
                }
                userRepository.delete(user);
        }

        // =========================================================
        // HELPERS
        // =========================================================

        /**
         * Xây dựng danh sách thống kê cho tất cả công ty với số liệu gộp theo 1 lần
         * query.
         */
        private List<AdminCompanyStatResponse> buildCompanyStats() {
                LocalDateTime last30 = LocalDateTime.now().minusDays(30);

                Map<Long, Long> employeeCount = toCountMap(userRepository.countGroupByCompany(Role.HR));
                Map<Long, Long> jobCount = toCountMap(jobRepository.countGroupByCompany());
                Map<Long, Long> openJobCount = toCountMap(
                                jobRepository.countGroupByCompanyAndStatus(Job.JobStatus.OPEN));
                Map<Long, Long> appCount = toCountMap(applicationRepository.countGroupByCompany());
                Map<Long, Long> appLast30 = toCountMap(applicationRepository.countGroupByCompanyAppliedAfter(last30));

                Map<Long, Long> hiredCount = new HashMap<>();
                for (Object[] row : applicationRepository.countGroupByCompanyAndStatus()) {
                        Long companyId = ((Number) row[0]).longValue();
                        ApplicationStatus status = (ApplicationStatus) row[1];
                        Long count = ((Number) row[2]).longValue();
                        if (status == ApplicationStatus.HIRED) {
                                hiredCount.merge(companyId, count, Long::sum);
                        }
                }

                // Số nhân viên đang hoạt động
                Map<Long, Long> activeEmployeeCount = new HashMap<>();
                userRepository.searchByRole(Role.HR, "", Pageable.unpaged()).getContent().forEach(u -> {
                        if (u.getCompany() != null && u.isEnabled()) {
                                activeEmployeeCount.merge(u.getCompany().getId(), 1L, Long::sum);
                        }
                });

                return companyRepository.findAll().stream()
                                .map(company -> {
                                        Long id = company.getId();
                                        return AdminCompanyStatResponse.builder()
                                                        .id(id)
                                                        .name(company.getName())
                                                        .email(company.getEmail())
                                                        .phone(company.getPhone())
                                                        .website(company.getWebsite())
                                                        .address(company.getAddress())
                                                        .city(company.getCity())
                                                        .industry(company.getIndustry())
                                                        .companySize(company.getCompanySize())
                                                        .logo(company.getLogo())
                                                        .coverImage(company.getCoverImage())
                                                        .description(company.getDescription())
                                                        .foundedYear(company.getFoundedYear())
                                                        .createdAt(company.getCreatedAt())
                                                        .employeeCount(employeeCount.getOrDefault(id, 0L))
                                                        .activeEmployeeCount(activeEmployeeCount.getOrDefault(id, 0L))
                                                        .jobCount(jobCount.getOrDefault(id, 0L))
                                                        .openJobCount(openJobCount.getOrDefault(id, 0L))
                                                        .applicationCount(appCount.getOrDefault(id, 0L))
                                                        .applicationsLast30Days(appLast30.getOrDefault(id, 0L))
                                                        .hiredCount(hiredCount.getOrDefault(id, 0L))
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private AdminCompanyStatResponse toCompanyStat(Company company) {
                return AdminCompanyStatResponse.builder()
                                .id(company.getId())
                                .name(company.getName())
                                .email(company.getEmail())
                                .phone(company.getPhone())
                                .website(company.getWebsite())
                                .address(company.getAddress())
                                .city(company.getCity())
                                .industry(company.getIndustry())
                                .companySize(company.getCompanySize())
                                .logo(company.getLogo())
                                .coverImage(company.getCoverImage())
                                .description(company.getDescription())
                                .foundedYear(company.getFoundedYear())
                                .createdAt(company.getCreatedAt())
                                .build();
        }

        private List<AdminOverviewResponse.TimeSeriesPoint> buildDailyTimeline(int days) {
                Map<LocalDate, Long> counts = new LinkedHashMap<>();
                LocalDate today = LocalDate.now();
                for (int i = days - 1; i >= 0; i--) {
                        counts.put(today.minusDays(i), 0L);
                }
                applicationRepository.findAll(Sort.by(Sort.Direction.DESC, "appliedAt")).stream()
                                .map(Application::getAppliedAt)
                                .filter(java.util.Objects::nonNull)
                                .map(LocalDateTime::toLocalDate)
                                .filter(counts::containsKey)
                                .forEach(d -> counts.merge(d, 1L, Long::sum));

                return counts.entrySet().stream()
                                .map(e -> AdminOverviewResponse.TimeSeriesPoint.builder()
                                                .label(e.getKey().format(DAY_FORMAT))
                                                .value(e.getValue())
                                                .build())
                                .collect(Collectors.toList());
        }

        private List<AdminOverviewResponse.TimeSeriesPoint> buildMonthlyTimeline(int months,
                        List<LocalDateTime> dates) {
                Map<YearMonth, Long> counts = new LinkedHashMap<>();
                YearMonth current = YearMonth.now();
                for (int i = months - 1; i >= 0; i--) {
                        counts.put(current.minusMonths(i), 0L);
                }
                for (LocalDateTime d : dates) {
                        YearMonth ym = YearMonth.from(d);
                        if (counts.containsKey(ym)) {
                                counts.merge(ym, 1L, Long::sum);
                        }
                }
                return counts.entrySet().stream()
                                .map(e -> AdminOverviewResponse.TimeSeriesPoint.builder()
                                                .label(e.getKey().format(MONTH_FORMAT))
                                                .value(e.getValue())
                                                .build())
                                .collect(Collectors.toList());
        }

        private Map<Long, Long> toCountMap(List<Object[]> rows) {
                Map<Long, Long> map = new HashMap<>();
                for (Object[] row : rows) {
                        if (row[0] == null)
                                continue;
                        map.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
                }
                return map;
        }

        private AdminOverviewResponse.RecentApplicationItem toRecentItem(Application app) {
                Job job = app.getJob();
                Company company = job != null ? job.getCompany() : null;
                return AdminOverviewResponse.RecentApplicationItem.builder()
                                .applicationId(app.getId())
                                .candidateId(app.getCandidate() != null ? app.getCandidate().getId() : null)
                                .candidateName(app.getCandidate() != null ? app.getCandidate().getFullName() : "N/A")
                                .candidateEmail(app.getCandidate() != null ? app.getCandidate().getEmail() : "N/A")
                                .jobTitle(job != null ? job.getTitle() : "N/A")
                                .companyName(company != null ? company.getName() : "N/A")
                                .status(app.getStatus())
                                .appliedAt(app.getAppliedAt())
                                .build();
        }

        private UserResponse toUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .address(user.getAddress())
                                .skills(user.getSkills())
                                .experience(user.getExperience())
                                .education(user.getEducation())
                                .resumeUrl(user.getResumeUrl())
                                .avatarUrl(user.getAvatarUrl())
                                .role(user.getRole())
                                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                                .enabled(user.isEnabled())
                                .build();
        }

        private boolean contains(String value, String keyword) {
                return value != null && value.toLowerCase().contains(keyword);
        }
}
