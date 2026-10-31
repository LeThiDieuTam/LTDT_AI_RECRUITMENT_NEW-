package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationIdOrderByScheduledAtDesc(Long applicationId);

    Optional<Interview> findByIdAndApplication_Job_Company(Long id, com.recruitment.backend.entity.Company company);
}
