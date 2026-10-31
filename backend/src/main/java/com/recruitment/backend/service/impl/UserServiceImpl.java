package com.recruitment.backend.service.impl;

import com.recruitment.backend.dto.request.UserProfileUpdateRequest;
import com.recruitment.backend.dto.response.UserResponse;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.exception.ResourceNotFoundException;
import com.recruitment.backend.repository.UserRepository;
import com.recruitment.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    @Override
    @Transactional(readOnly = true) // Read-only transaction for fetching data
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmailWithCompany(email) // Use findByEmailWithCompany
                .orElseThrow(() -> new UsernameNotFoundException("HR user not found with email: " + email));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .skills(user.getSkills())
                .experience(user.getExperience())
                .education(user.getEducation())
                .resumeUrl(user.getResumeUrl())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .build();
    }
    @Override
    @Transactional // Transactional for data modification
    public UserResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = userRepository.findByEmailWithCompany(email) // Use findByEmailWithCompany
                .orElseThrow(() -> new UsernameNotFoundException("HR user not found with email: " + email));

        // Chỉ cập nhật các trường được cung cấp trong request
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getExperience() != null) {
            user.setExperience(request.getExperience());
        }
        if (request.getEducation() != null) {
            user.setEducation(request.getEducation());
        }
        if (request.getResumeUrl() != null) {
            user.setResumeUrl(request.getResumeUrl());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);

        return getProfile(updatedUser.getEmail()); // Return the updated profile
    }
}
