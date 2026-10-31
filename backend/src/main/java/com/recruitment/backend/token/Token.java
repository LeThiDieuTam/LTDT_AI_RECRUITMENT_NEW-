package com.recruitment.backend.token;

import com.recruitment.backend.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Ensure ID generation strategy
    private Integer id; 
    @Column(unique = true)
    private String token; 

    @Enumerated(EnumType.STRING) 
    @Builder.Default 
    private TokenType tokenType = TokenType.BEARER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; 

    private boolean revoked; 
    private boolean expired; 
}