package com.recruitment.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String location;
    private String salary;
    private String experience;

    @Enumerated(EnumType.STRING)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private String jobLevel; // Ví dụ: "Entry-level", "Mid-level", "Senior"

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EmploymentType {
        FULL_TIME,
        PART_TIME,
        CONTRACT,
        TEMPORARY,
        INTERNSHIP,
        VOLUNTEER
    }

    public enum JobType {
        IT,
        MARKETING,
        FINANCE,
        HR,
        DESIGN,
        OTHER
    }

    public enum JobStatus {
        OPEN,
        CLOSED,
        DRAFT,
        PAUSED
    }
}