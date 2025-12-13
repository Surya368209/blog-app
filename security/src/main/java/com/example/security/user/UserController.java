package com.example.security.user;

import com.example.security.user.dto.UpdateProfileRequest;
import com.example.security.user.dto.UserProfileDTO;
import com.example.security.user.entity.User;
import com.example.security.user.follow.FollowRepository;
import com.example.security.user.repository.UserRepository;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // subject in JWT = email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserProfileDTO mapToDto(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstname())
                .lastName(user.getLastname())
                .email(user.getEmail())
                .accountType(user.getAccountType() != null ? user.getAccountType().name() : null)
                .role(user.getRole() != null ? user.getRole().name() : null)
                .verified(user.isVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .followerCount(followRepository.countByFollowing(user)) 
                .followingCount(followRepository.countByFollower(user))
                .build();
    }

    // 🔹 READ: Current logged-in user profile
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile() {
        User current = getCurrentUser();
        return ResponseEntity.ok(mapToDto(current));
    }

    // NEW ENDPOINT: READ Public Profile by ID
    // Frontend calls this when you click a name (e.g. /users/5)
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return ResponseEntity.ok(mapToDto(user));
    }

    // UPDATE: Basic profile fields
    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        User current = getCurrentUser();

        current.setFirstname(request.getFirstName());
        current.setLastname(request.getLastName());

        User saved = userRepository.save(current);
        return ResponseEntity.ok(mapToDto(saved));
    }

    // NEW: Get Random Suggested Teachers
    @GetMapping("/suggestions")
    public ResponseEntity<List<UserProfileDTO>> getSuggestedTeachers() {
        // 1. Fetch from DB using the custom random query
        List<User> teachers = userRepository.findRandomVerifiedTeachers();
        
        // 2. Map to DTOs
        List<UserProfileDTO> response = teachers.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    // GET /api/v1/user/search?query=John
    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<User> users = userRepository.findByFirstnameContainingIgnoreCaseOrLastnameContainingIgnoreCase(query, query);
        
        List<UserProfileDTO> response = users.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile-image")
    public ResponseEntity<UserProfileDTO> uploadProfileImage(@RequestParam("file") MultipartFile file)
            throws IOException, java.io.IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User current = getCurrentUser();

        // create upload directory if not exists
        String uploadDir = "uploads/profile-images/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // unique filename
        String original = file.getOriginalFilename();
        String safeName = (original != null ? original.replaceAll("\\s+", "_") : "image");
        String filename = "user-" + current.getId() + "-" + System.currentTimeMillis() + "-" + safeName;

        Path filePath = Paths.get(uploadDir + filename);
        Files.write(filePath, file.getBytes());

        // URL that frontend will use
        String imageUrl = "/profile-images/" + filename;

        current.setProfileImageUrl(imageUrl);
        User saved = userRepository.save(current);

        return ResponseEntity.ok(mapToDto(saved));
    }
}