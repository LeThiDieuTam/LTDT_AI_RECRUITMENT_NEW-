package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.ApplicationStatus;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    // Custom count methods for HrDashboardService
    long countByJob_Company(Company company);
    long countByJob_CompanyAndStatus(Company company, ApplicationStatus status);
    long countByJob_CompanyAndAppliedAtAfter(Company company, LocalDateTime dateTime);
    Optional<Application> findByIdAndJob_Company(Long id, Company company);

    // Queries with JOIN FETCH for eager loading candidate & job
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.company = :company")
    List<Application> findAllByCompanyWithCandidateAndJob(@Param("company") Company company);

    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.company = :company AND " +
           "(LOWER(c.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "(c.skills IS NOT NULL AND LOWER(c.skills) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    List<Application> searchByCompanyAndSearchTerm(@Param("company") Company company, @Param("searchTerm") String searchTerm);

    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE a.candidate = :candidate AND j.company = :company ORDER BY a.appliedAt DESC")
    List<Application> findByCandidateAndCompanyWithDetails(@Param("candidate") User candidate, @Param("company") Company company);

    List<Application> findByJob_Company(Company company);
    List<Application> findByCandidate(User candidate);
    List<Application> findByCandidateOrderByAppliedAtDesc(User candidate);
    boolean existsByCandidateAndJob_Company(User candidate, Company company);
    List<Application> findByCandidateAndJob_Company(User candidate, Company company);

    // For apply-for-job: check duplicate application
    boolean existsByCandidateAndJob_Id(User candidate, Long jobId);

    // For HR dashboard: recent applicants with JOIN FETCH
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE j.company = :company ORDER BY a.appliedAt DESC")
    List<Application> findRecentByCompany(@Param("company") Company company);

    List<Application> findTop5ByJob_CompanyOrderByAppliedAtDesc(Company company);

    // For candidate's own application history
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j LEFT JOIN FETCH j.company comp WHERE c.email = :email ORDER BY a.appliedAt DESC")
    List<Application> findByCandidateEmailWithDetails(@Param("email") String email);

    List<Application> findByCandidate_EmailOrderByAppliedAtDesc(String email);

    // =========================================================
    // ADMIN - thống kê & quản lý
    // =========================================================
    long countByStatus(ApplicationStatus status);
    long countByAppliedAtAfter(LocalDateTime dateTime);

    @Query("SELECT a.job.company.id, COUNT(a) FROM Application a GROUP BY a.job.company.id")
    List<Object[]> countGroupByCompany();

    @Query("SELECT a.job.company.id, COUNT(a) FROM Application a WHERE a.appliedAt >= :from GROUP BY a.job.company.id")
    List<Object[]> countGroupByCompanyAppliedAfter(@Param("from") LocalDateTime from);

    @Query("SELECT a.job.company.id, a.status, COUNT(a) FROM Application a GROUP BY a.job.company.id, a.status")
    List<Object[]> countGroupByCompanyAndStatus();

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT DISTINCT a.candidate.id FROM Application a")
    List<Long> findDistinctCandidateIdsWithApplication();

    // Lấy danh sách ứng viên (kèm đơn gần nhất) toàn hệ thống
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j LEFT JOIN FETCH j.company comp ORDER BY a.appliedAt DESC")
    Page<Application> findAllWithCandidateAndJob(Pageable pageable);

    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j LEFT JOIN FETCH j.company comp " +
           "WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.skills) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY a.appliedAt DESC")
    Page<Application> searchWithCandidateAndJob(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.company = :company")
    long countByCompany(@Param("company") Company company);

    @Query("SELECT a FROM Application a JOIN FETCH a.candidate c JOIN FETCH a.job j WHERE a.job.company = :company ORDER BY a.appliedAt DESC")
    List<Application> findAllByCompanyOrderByAppliedAtDesc(@Param("company") Company company);
}