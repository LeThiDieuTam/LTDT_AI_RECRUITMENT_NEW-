package com.recruitment.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;


    // =========================================================
    // LẤY USERNAME / EMAIL TỪ JWT
    // =========================================================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    // =========================================================
    // LẤY CLAIM
    // =========================================================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        final Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }


    // =========================================================
    // TẠO TOKEN
    // =========================================================

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Ensure roles are always included
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            String authorities = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
            claims.put("roles", authorities);
        }

        return buildToken(
                claims, userDetails, jwtExpiration
        );
    }


    // =========================================================
    // TẠO TOKEN + EXTRA CLAIMS
    // =========================================================

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        // Ensure roles are always included, even if extraClaims are provided and not already present
        if (!extraClaims.containsKey("roles") && userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            String authorities = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
            extraClaims.put("roles", authorities);
        }
        
        return buildToken(
                extraClaims,
                userDetails,
                jwtExpiration
        );
    }


    // =========================================================
    // BUILD JWT
    // =========================================================

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {

        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expiration
                        )
                )
                .signWith(getSignInKey())
                .compact();
    }


    // =========================================================
    // KIỂM TRA TOKEN
    // =========================================================

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {

        try {

            final String username =
                    extractUsername(token);

            return username.equals(
                    userDetails.getUsername()
            )
                    && !isTokenExpired(token);

        } catch (Exception ex) {

            return false;
        }
    }


    // =========================================================
    // KIỂM TRA TOKEN HẾT HẠN
    // =========================================================

    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }


    // =========================================================
    // LẤY EXPIRATION
    // =========================================================

    private Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }


    // =========================================================
    // ĐỌC TOÀN BỘ CLAIMS
    // =========================================================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // =========================================================
    // TẠO SECRET KEY
    // =========================================================

    private SecretKey getSignInKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(secretKey);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}