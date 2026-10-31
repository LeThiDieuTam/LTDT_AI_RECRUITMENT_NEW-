package com.recruitment.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String education;

    /**
     * URL đến CV của ứng viên
     */
    private String resumeUrl;

    /**
     * Ảnh đại diện (avatar) của người dùng (URL).
     */
    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    /**
     * Vai trò của người dùng:
     * CANDIDATE, HR, ADMIN
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Công ty của HR.
     * Candidate/Admin có thể không có company.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Company company;

    /**
     * Trạng thái tài khoản.
     */
    @Builder.Default // Thêm annotation này để @Builder tôn trọng giá trị mặc định
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Tự động tạo thời gian khi user được tạo.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    /**
     * Tự động cập nhật thời gian khi user được cập nhật.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // Spring Security - UserDetails
    // =========================================================

    /**
     * Trả về quyền của user cho Spring Security.
     *
     * Database:
     *      HR
     *
     * Spring Security:
     *      ROLE_HR
     *
     * Database:
     *      ADMIN
     *
     * Spring Security:
     *      ROLE_ADMIN
     *
     * Database:
     *      CANDIDATE
     *
     * Spring Security:
     *      ROLE_CANDIDATE
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (role == null) {
            return List.of();
        }

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }

    /**
     * Spring Security sử dụng email làm username.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Tài khoản có hết hạn hay không.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Tài khoản có bị khóa hay không.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Credentials có hết hạn hay không.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Tài khoản có được kích hoạt hay không.
     */
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}