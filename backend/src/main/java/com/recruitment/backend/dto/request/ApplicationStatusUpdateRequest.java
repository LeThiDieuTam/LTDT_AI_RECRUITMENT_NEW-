package com.recruitment.backend.dto.request;

import com.recruitment.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusUpdateRequest {
    @NotNull(message = "New status cannot be null")
    private ApplicationStatus newStatus;
    private String feedback; // Optional feedback for the status change
}