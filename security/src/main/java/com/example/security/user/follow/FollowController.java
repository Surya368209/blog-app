package com.example.security.user.follow;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.security.user.dto.UserProfileDTO;

@RestController
@RequestMapping("/api/v1/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // student follows teacher
    @PostMapping("/{teacherId}")
    public ResponseEntity<Void> followTeacher(@PathVariable Long teacherId) {
        followService.followTeacher(teacherId);
        return ResponseEntity.ok().build();
    }

    // student unfollows teacher
    @DeleteMapping("/{teacherId}")
    public ResponseEntity<Void> unfollowTeacher(@PathVariable Long teacherId) {
        System.out.println(" UNFOLLOW controller hit with teacherId=" + teacherId);
        followService.unfollowTeacher(teacherId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{teacherId}/followers")
    public ResponseEntity<List<UserProfileDTO>> getFollowers(@PathVariable Long teacherId) {
        return ResponseEntity.ok(followService.getFollowers(teacherId));
    }

    @GetMapping("/{studentId}/following")
    public ResponseEntity<List<UserProfileDTO>> getFollowing(@PathVariable Long studentId) {
        return ResponseEntity.ok(followService.getFollowing(studentId));
    }
}
