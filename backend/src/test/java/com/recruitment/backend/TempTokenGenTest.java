package com.recruitment.backend;

import com.recruitment.backend.entity.Role;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.repository.UserRepository;
import com.recruitment.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TempTokenGenTest {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;

    @Test
    public void generateAdminToken() throws Exception {
        User admin = userRepository.findByEmail("admin@gmail.com").orElseThrow();
        admin.setRole(Role.ADMIN);
        String token = jwtService.generateToken(admin);
        java.nio.file.Files.writeString(
                java.nio.file.Path.of("C:/Users/Admin/AppData/Local/Temp/admin_token.txt"), token);
        System.out.println("TOKEN_WRITTEN len=" + token.length());
    }
}
