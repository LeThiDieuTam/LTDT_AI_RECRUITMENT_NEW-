package com.recruitment.backend.security;

import com.recruitment.backend.token.Token; // Import Token entity
import com.recruitment.backend.repository.TokenRepository; // Giả định bạn có TokenRepository
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    // Cần một TokenRepository để lưu trữ và quản lý các JWT token
    // Nếu bạn chưa có, bạn sẽ cần tạo Token entity và TokenRepository
    private final TokenRepository tokenRepository;

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return; // Không có token, không làm gì cả
        }
        jwt = authHeader.substring(7);
        var storedToken = tokenRepository.findByToken(jwt)
                .orElse(null);
        if (storedToken != null) {
            storedToken.setExpired(true); // Lombok @Setter
            storedToken.setRevoked(true); // Lombok @Setter
            tokenRepository.save(storedToken); // Lưu trạng thái token đã bị thu hồi
        }
    }
}