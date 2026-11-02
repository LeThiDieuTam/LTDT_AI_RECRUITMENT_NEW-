package com.recruitment.backend.config;

import com.recruitment.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final LogoutHandler logoutHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ==========================
                        // PUBLIC
                        // ==========================

                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/uploads/**"
                        ).permitAll()

                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/jobs/**",
                                "/api/companies/**"
                        ).permitAll()

                        // ==========================
                        // ADMIN
                        // ==========================

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // ==========================
                        // HR
                        // ==========================

                        .requestMatchers(
                                "/api/hr/profile/**",
                                "/api/users/hr/dashboard-summary",
                                "/api/hr/jobs/**",
                                "/api/hr/applications/**"
                        ).hasRole("HR")

                        // ==========================
                        // CANDIDATE
                        // ==========================

                        .requestMatchers(
                                "/api/candidates/dashboard/**",
                                "/api/candidates/my-applications"
                        ).hasRole("CANDIDATE")

                        // ==========================
                        // CVS
                        // ==========================

                        .requestMatchers(
                                "/api/cvs/**"
                        ).hasAnyRole(
                                "CANDIDATE",
                                "HR",
                                "ADMIN"
                        )

                        // ==========================
                        // USER PROFILE
                        // ==========================

                        .requestMatchers(
                                "/api/users/profile"
                        ).hasAnyRole(
                                "CANDIDATE",
                                "HR",
                                "ADMIN"
                        )

                        // ==========================
                        // JOBS
                        // ==========================

                        .requestMatchers(
                                "/api/jobs/**"
                        ).hasAnyRole(
                                "CANDIDATE",
                                "HR",
                                "ADMIN"
                        )

                        // ==========================
                        // EVERYTHING ELSE
                        // ==========================

                        .anyRequest().authenticated()
                )

                // ==========================
                // JWT = STATELESS
                // ==========================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==========================
                // AUTH PROVIDER
                // ==========================

                .authenticationProvider(authenticationProvider)

                // ==========================
                // JWT FILTER
                // ==========================

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                // ==========================
                // LOGOUT
                // ==========================

                .logout(logout ->
                        logout
                                .logoutUrl("/api/auth/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler(
                                        (request, response, authentication) -> { // Lambda expression for LogoutSuccessHandler
                                            response.setStatus(200); // Thay thế HttpServletResponse.SC_OK bằng giá trị số nguyên 200
                                        }
                                )
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173"
                    "https://vercel.app"
                )
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
