package com.recruitment.backend.dto.response;

import com.recruitment.backend.entity.Interview;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InterviewResponse {
    private Long id;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingUrl;
    private String interviewer;
    private Interview.InterviewResult result;
    private String notes;
}
