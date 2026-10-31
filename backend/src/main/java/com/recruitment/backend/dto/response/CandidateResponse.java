package com.recruitment.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private List<String> skills; // Frontend mong đợi List<String>
    private String experience;
    private String education;
    private String status; // Trả về dạng String để frontend dễ xử lý
    // Có thể thêm createdAt, updatedAt nếu cần hiển thị

    // Helper method để chuyển đổi chuỗi skills thành List<String>
    public void setSkills(String skillsString) {
        this.skills = skillsString != null && !skillsString.isEmpty() ? List.of(skillsString.split(",")) : List.of();
    }
}