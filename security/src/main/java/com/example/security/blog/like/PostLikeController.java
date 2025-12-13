package com.example.security.blog.like;

import com.example.security.blog.like.dto.PostLikeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts/{postId}/likes")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping
    public ResponseEntity<PostLikeResponse> likePost(@PathVariable Long postId) {
        return ResponseEntity.ok(postLikeService.likePost(postId));
    }

    @DeleteMapping
    public ResponseEntity<PostLikeResponse> unlikePost(@PathVariable Long postId) {
        return ResponseEntity.ok(postLikeService.unlikePost(postId));
    }

    @GetMapping
    public ResponseEntity<PostLikeResponse> getLikeStatus(@PathVariable Long postId) {
        return ResponseEntity.ok(postLikeService.getLikeStatus(postId));
    }
}
