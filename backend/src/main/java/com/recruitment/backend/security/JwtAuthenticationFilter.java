package com.recruitment.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String requestUri = request.getRequestURI();

        System.out.println(
                "JWT FILTER -> "
                        + request.getMethod()
                        + " "
                        + requestUri
        );

        // ==========================================
        // OPTIONS - CORS
        // ==========================================

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // Authorization header
        // ==========================================

        final String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "JWT FILTER -> No Bearer token"
            );

            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // JWT
        // ==========================================

        final String jwt =
                authHeader.substring(7);

        try {

            // ======================================
            // Extract email
            // ======================================

            final String userEmail =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "JWT FILTER -> Email: "
                            + userEmail
            );

            if (userEmail == null) {

                System.out.println(
                        "JWT FILTER -> Email is null"
                );

                filterChain.doFilter(request, response);
                return;
            }

            // ======================================
            // SecurityContext
            // ======================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                // ==================================
                // Load user
                // ==================================

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(userEmail);

                System.out.println(
                        "JWT FILTER -> User: "
                                + userDetails.getUsername()
                );

                // ==================================
                // AUTHORITIES
                // ==================================

                System.out.println(
                        "JWT FILTER -> Authorities: "
                                + userDetails.getAuthorities()
                );

                // ==================================
                // Validate token
                // ==================================

                boolean valid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails
                        );

                System.out.println(
                        "JWT FILTER -> Token valid: "
                                + valid
                );

                if (valid) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );

                    System.out.println(
                            "JWT FILTER -> Authentication SET"
                    );

                    System.out.println(
                            "JWT FILTER -> Final authorities: "
                                    + authentication.getAuthorities()
                    );
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "JWT FILTER ERROR: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "JWT FILTER ERROR MESSAGE: "
                            + e.getMessage()
            );

            SecurityContextHolder.clearContext();
        }

        // ==========================================
        // Continue
        // ==========================================

        filterChain.doFilter(
                request,
                response
        );
    }
}