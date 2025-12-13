package com.example.security.config;

import com.example.security.user.Role;
import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // Import this
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Inject values from Environment
    // Format: "${PROPERTY_NAME:DEFAULT_VALUE}"
    @Value("${admin.email:poornanaga30753@gmail.com}") 
    private String adminEmail;

    @Value("${admin.password:SecretPass2025}") 
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin exists using the configured email
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            
            User admin = User.builder()
                    .firstname("Super")
                    .lastname("Admin")
                    .email(adminEmail) // Use variable
                    .password(passwordEncoder.encode(adminPassword)) // Use variable
                    .role(Role.ADMIN)
                    .verified(true)
                    .build();

            userRepository.save(admin);
            System.out.println("ADMIN SEEDED: " + adminEmail);
            // SECURITY TIP: In production, don't print the password to logs!
            System.out.println("Password set from Environment Variable (or default)");
        }
    }
}