package com.example.security.blog.post;

import com.example.security.blog.post.dto.CreatePostRequest;
import com.example.security.blog.post.dto.UpdatePostRequest;
import com.example.security.blog.post.dto.PostResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 1. NEW ENDPOINT: Upload Image
    // Frontend calls this first, gets URL, then calls createPost
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = postService.uploadPostImage(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(postService.createPost(request));
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody UpdatePostRequest request
    ) {
        return ResponseEntity.ok(postService.updatePost(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // 2. FIX: Return List, and call correct Service method
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostResponse>> searchPosts(@RequestParam(required = false) String tag) {
        // Just call the service
        return ResponseEntity.ok(postService.searchPostsByTag(tag));
    }

    // GET /api/v1/posts/trending-tags
    @GetMapping("/trending-tags")
    public ResponseEntity<List<String>> getTrendingTags() {
        return ResponseEntity.ok(postService.getTrendingTags());
    }

    // GET /api/v1/posts/popular
    @GetMapping("/popular")
    public ResponseEntity<List<PostResponse>> getPopularPosts() {
        return ResponseEntity.ok(postService.getPopularPosts());
    }
}