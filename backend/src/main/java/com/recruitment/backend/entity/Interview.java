package com.recruitment.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    @Column(nullable = false)
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingUrl;
    private String interviewer;
    @Enumerated(EnumType.STRING)
    private InterviewResult result;
    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum InterviewResult {
        SCHEDULED, PASSED, FAILED, NEEDS_REVIEW, CANCELLED
    }
}
