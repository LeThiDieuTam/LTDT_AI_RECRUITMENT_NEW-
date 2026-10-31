package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByCompany(Company company);
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    Optional<Job> findByIdAndCompany(Long id, Company company);
    boolean existsByIdAndCompany(Long id, Company company);
    long countByCompanyAndStatus(Company company, Job.JobStatus status); // Sử dụng Job.JobStatus enum
    // Removed: long countByCompanyAndApplicationDeadlineBefore(Company company, LocalDate date); // Đếm công việc hết hạn dựa trên applicationDeadline
    // =========================================================
    // ADMIN - thống kê
    // =========================================================
    long countByStatus(Job.JobStatus status);
    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT j.company.id, COUNT(j) FROM Job j GROUP BY j.company.id")
    List<Object[]> countGroupByCompany();

    @Query("SELECT j.company.id, COUNT(j) FROM Job j WHERE j.status = :status GROUP BY j.company.id")
    List<Object[]> countGroupByCompanyAndStatus(@Param("status") Job.JobStatus status);

    @Query("SELECT j.company.id, COUNT(j) FROM Job j WHERE j.createdAt >= :from GROUP BY j.company.id")
    List<Object[]> countGroupByCompanyCreatedAfter(@Param("from") LocalDateTime from);

    @Query("SELECT j.title, j.company.name, COUNT(a) FROM Application a JOIN a.job j GROUP BY j.id, j.title, j.company.name ORDER BY COUNT(a) DESC")
    List<Object[]> findTopJobsByApplications(org.springframework.data.domain.Pageable pageable);
}