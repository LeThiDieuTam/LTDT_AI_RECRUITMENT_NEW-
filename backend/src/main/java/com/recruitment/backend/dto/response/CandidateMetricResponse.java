package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateMetricResponse {
    private String label;
    private String value;
    private String description;
    private int progress;
}
