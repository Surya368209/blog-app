package com.example.security.user.follow;

import com.example.security.notification.NotificationService;
import com.example.security.notification.NotificationType;
import com.example.security.user.AccountType;
import com.example.security.user.dto.UserProfileDTO;
import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // username = email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public void followTeacher(Long teacherId) {
        User current = getCurrentUser();
        System.out.println("FOLLOW: currentUser=" + current.getId() + " type=" + current.getAccountType() + ", teacherId=" + teacherId);
        if (current.getAccountType() != AccountType.STUDENT) {
            throw new RuntimeException("Only students can follow teachers");
        }

        if (current.getId().equals(teacherId)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (teacher.getAccountType() != AccountType.TEACHER) {
            throw new RuntimeException("You can only follow teachers");
        }

        if (followRepository.existsByFollowerAndFollowing(current, teacher)) {
            return;
        }

        Follow follow = Follow.builder()
                .follower(current)
                .following(teacher)
                .createdAt(LocalDateTime.now())
                .build();

        followRepository.save(follow);
        
        // 3. TRIGGER NOTIFICATION
        notificationService.createNotification(
            teacher,                 // Recipient (The teacher being followed)
            current,                 // Actor (The student who followed)
            NotificationType.FOLLOW, 
            null                     // No post ID
        );
    }

    public void unfollowTeacher(Long teacherId) {
        User current = getCurrentUser();
        System.out.println("UNFOLLOW: currentUser=" + current.getId() + " type=" + current.getAccountType() + ", teacherId=" + teacherId);
        if(current.getAccountType() != AccountType.STUDENT) {
            throw new RuntimeException("Only students can unfollow teachers");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        followRepository.findByFollowerAndFollowing(current, teacher)
                .ifPresent(followRepository::delete);
    }

//  NEW METHOD: Get list of students following a teacher
    public List<UserProfileDTO> getFollowers(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Get the list of Follow entities where 'following' is the teacher
        List<Follow> follows = followRepository.findByFollowing(teacher);

        // Convert List<Follow> -> List<UserProfileDTO>
        return follows.stream()
                .map(follow -> {
                    User student = follow.getFollower(); // Get the student
                    return UserProfileDTO.builder()
                            .id(student.getId())
                            .firstName(student.getFirstname())
                            .lastName(student.getLastname())
                            .email(student.getEmail())
                            .accountType(student.getAccountType().name())
                            .profileImageUrl(student.getProfileImageUrl())
                            // .role(...) if needed
                            .build();
                })
                .collect(Collectors.toList());
    }

//  NEW METHOD: Get list of teachers whom a student follows
public List<UserProfileDTO> getFollowing(Long studentId) {
    User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    // Get list of Follow entities where 'follower' is the student
    List<Follow> follows = followRepository.findByFollower(student);

    return follows.stream()
            .map(follow -> {
                User teacher = follow.getFollowing(); // Get the teacher
                return UserProfileDTO.builder()
                        .id(teacher.getId())
                        .firstName(teacher.getFirstname())
                        .lastName(teacher.getLastname())
                        .email(teacher.getEmail())
                        .accountType(teacher.getAccountType().name())
                        .profileImageUrl(teacher.getProfileImageUrl())
                        .build();
            })
            .collect(Collectors.toList());
}
}
