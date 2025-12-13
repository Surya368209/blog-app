package com.example.security.admin;

import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    // Toggle Verification Status
    // Only accessible by users with role 'ADMIN'
    @PutMapping("/verify/{userId}")
    public ResponseEntity<String> toggleVerification(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean newStatus = !user.isVerified();
        user.setVerified(newStatus);
        
        userRepository.save(user);

        return ResponseEntity.ok("Verification status changed to: " + newStatus);
    }
}