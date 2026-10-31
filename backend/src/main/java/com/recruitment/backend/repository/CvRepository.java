package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Cv;
import com.recruitment.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {

    List<Cv> findByCandidateOrderByUpdatedAtDesc(User candidate);

    List<Cv> findByCandidate_EmailOrderByUpdatedAtDesc(String email);

    Optional<Cv> findByIdAndCandidate(Long id, User candidate);

    Optional<Cv> findByIdAndCandidate_Email(Long id, String email);

    Optional<Cv> findByCandidateAndIsDefaultTrue(User candidate);

    Optional<Cv> findByCandidate_EmailAndIsDefaultTrue(String email);

    long countByCandidate(User candidate);

    @Query("SELECT c.candidate.id, COUNT(c) FROM Cv c GROUP BY c.candidate.id")
    List<Object[]> countGroupByCandidate();

    @Modifying
    @Query("UPDATE Cv c SET c.isDefault = false WHERE c.candidate = :candidate")
    void resetDefaultCvForCandidate(@Param("candidate") User candidate);
}
