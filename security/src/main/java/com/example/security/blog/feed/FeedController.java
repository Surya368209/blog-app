package com.example.security.blog.feed;

import com.example.security.blog.post.PostService;
import com.example.security.blog.post.dto.PostResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final PostService postService;

    // all posts by teachers + students
    @GetMapping("/all")
    public ResponseEntity<List<PostResponse>> getAllFeed() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // posts from teachers that the current student follows
    @GetMapping("/following")
    public ResponseEntity<List<PostResponse>> getFollowingFeed() {
        return ResponseEntity.ok(feedService.getFollowingFeed());
    }
}
