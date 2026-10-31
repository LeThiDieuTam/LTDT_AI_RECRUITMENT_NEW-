package com.recruitment.backend.dto.request;

import com.recruitment.backend.entity.Interview;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewRequest {
    @NotNull
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingUrl;
    private String interviewer;
    private Interview.InterviewResult result;
    private String notes;
}
