package com.example.security.auth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.security.auth.dto.AuthenticationRequest;
import com.example.security.auth.dto.AuthenticationResponse;
import com.example.security.auth.dto.RegisterRequest;
import com.example.security.config.EmailService;
import com.example.security.jwt.JwtService;
import com.example.security.user.Role;
import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final UserRepository repository;

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final EmailService emailService;

    @Value("${application.frontend.reset-password-url}")
    private String frontendUrl;
    
    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
            .firstname(request.getFirstname())
            .lastname(request.getLastname())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.USER)
            .accountType(request.getAccountType())
            .verified(false)
            .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var response = AuthenticationResponse.builder()
            .token(jwtToken)
            .build();
        return response;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
         var user = repository.findByEmail(request.getEmail())
            .orElseThrow();
         var jwtToken = jwtService.generateToken(user);
         return AuthenticationResponse.builder()
            .token(jwtToken)
            .build();
    }


    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate random token
        String token = UUID.randomUUID().toString();
        
        // Save to DB (expires in 15 mins)
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // ✅ DYNAMIC LINK GENERATION
        // Uses the IP/Domain defined in your properties file
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        try {
            emailService.sendResetEmail(email, resetLink);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email");
        }
    }

        // 2. RESET PASSWORD (Validate & Update)
        public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token) // Note: Add this method to UserRepository
                .orElseThrow(() -> new RuntimeException("Invalid Token"));

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        // Update Password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear Token
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        
        userRepository.save(user);
    }
}
