package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Role;
import com.recruitment.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.company WHERE u.email = :email")
    Optional<User> findByEmailWithCompany(String email);
    boolean existsByEmail(String email);

    // =========================================================
    // ADMIN - thống kê & quản lý
    // =========================================================
    long countByRole(Role role);
    long countByCompany(Company company);
    long countByEnabled(boolean enabled);
    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countGroupByRole();

    @Query("SELECT c.id, COUNT(u) FROM User u JOIN u.company c WHERE u.role = :role GROUP BY c.id")
    List<Object[]> countGroupByCompany(@Param("role") Role role);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.company c WHERE u.role = :role AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> searchByRole(@Param("role") Role role, @Param("keyword") String keyword, Pageable pageable);
}