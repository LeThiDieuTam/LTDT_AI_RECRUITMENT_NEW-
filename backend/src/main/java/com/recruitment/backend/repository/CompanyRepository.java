package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {
    Optional<Company> findByName(String name);
    boolean existsByEmail(String email);
    boolean existsByName(String name);

    // =========================================================
    // ADMIN - tìm kiếm công ty kèm từ khóa
    // =========================================================
    @Query("SELECT c FROM Company c WHERE (:keyword IS NULL OR :keyword = '' " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.city) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:industry IS NULL OR :industry = '' OR c.industry = :industry)")
    List<Company> searchForAdmin(@Param("keyword") String keyword, @Param("industry") String industry);

    long countByCreatedAtAfter(LocalDateTime dateTime);
}