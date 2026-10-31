package com.recruitment.backend.security;

import com.recruitment.backend.entity.User; // Đảm bảo import đúng lớp User của bạn
import com.recruitment.backend.repository.UserRepository; // Đảm bảo import đúng UserRepository của bạn
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Object originalRole = user.getRole();
        String rawRole = "";
        
        if (originalRole == null) {
            logger.warn("User {} has a null role. Assigning default 'UNKNOWN' role.", user.getEmail());
            rawRole = "UNKNOWN"; 
        } else if (originalRole instanceof Enum) {
            rawRole = ((Enum<?>) originalRole).name(); 
        } else { 
            rawRole = originalRole.toString(); 
        }

        // Đảm bảo vai trò luôn là chữ hoa để tránh lỗi case-sensitivity
        rawRole = rawRole.toUpperCase();

        String authorityString;
        // Nếu rawRole là một chuỗi rỗng sau khi toUpperCase() (ví dụ: originalRole là một chuỗi rỗng), gán một vai trò mặc định
        if (rawRole.isEmpty()) {
            logger.warn("User {} has an empty raw role after toUpperCase(). Assigning default 'UNKNOWN' role.", user.getEmail());
            rawRole = "UNKNOWN";
        }

        // Đảm bảo chuỗi quyền có tiền tố "ROLE_"
        // Nếu user.getRole() đã trả về một String có dạng "ROLE_HR", thì rawRole đã là "ROLE_HR"
        // Nếu user.getRole() là enum Role.HR, thì rawRole là "HR", và sẽ được thêm tiền tố "ROLE_"
        // Logic này đảm bảo rằng quyền cuối cùng luôn có dạng "ROLE_XYZ"
        // và xử lý trường hợp tiền tố "ROLE_" đã tồn tại để tránh "ROLE_ROLE_XYZ"

        if (rawRole.startsWith("ROLE_")) {
            authorityString = rawRole; // Nếu đã có tiền tố, sử dụng trực tiếp
        } else {
            authorityString = "ROLE_" + rawRole; // Thêm tiền tố "ROLE_"
        }
        // --- Kết thúc phần sửa lỗi ---

        logger.debug("User {} (original role: {}, processed raw role: {}) has authority: {}", user.getEmail(), originalRole, rawRole, authorityString);

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(authorityString)
        );
        
        // Cải thiện: Nếu User entity có các trường này, hãy sử dụng chúng thay vì hardcode 'true'
        // Ví dụ: user.isAccountNonExpired(), user.isCredentialsNonExpired(), user.isAccountNonLocked()
        boolean accountNonExpired = true; 
        boolean credentialsNonExpired = true; 
        boolean accountNonLocked = true; 

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), user.isEnabled(),
                accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
    }
}