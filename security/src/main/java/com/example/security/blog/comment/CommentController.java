package com.example.security.blog.comment;

import com.example.security.blog.comment.dto.CommentResponse;
import com.example.security.blog.comment.dto.CreateCommentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request
    ) {
        return ResponseEntity.ok(commentService.addComment(postId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsForPost(
            @PathVariable Long postId
    ) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,      // not used, but kept for REST shape
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
