package com.example.security.blog.comment;

import com.example.security.blog.comment.dto.CommentResponse;
import com.example.security.blog.comment.dto.CreateCommentRequest;
import com.example.security.blog.post.Post;
import com.example.security.blog.post.PostRepository;
import com.example.security.notification.NotificationService;
import com.example.security.notification.NotificationType;
import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // username = email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public CommentResponse addComment(Long postId, CreateCommentRequest request) {
        User author = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .post(post)
                .author(author)
                .build();

        Comment saved = commentRepository.save(comment);

        // 2. TRIGGER NOTIFICATION HERE
        notificationService.createNotification(
            post.getAuthor(),       // Recipient (Post Owner)
            author,                 // Actor (Who commented)
            NotificationType.COMMENT, 
            post.getId()            // Related Post ID
        );

        return mapToResponse(saved);
    }

    public List<CommentResponse> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return commentRepository.findByPost(post)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deleteComment(Long commentId) {
        User currentUser = getCurrentUser();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("Not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        User author = comment.getAuthor();
        String fullName = (author.getLastname() + " " + author.getFirstname()).trim();

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .postId(comment.getPost().getId())
                .authorId(author.getId())
                .authorName(fullName)
                .authorRole(author.getRole().name())
                .authorVerified(author.isVerified())
                .authorImageUrl(author.getProfileImageUrl()) 
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
