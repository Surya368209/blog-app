package com.example.security.blog.like;

import com.example.security.blog.like.dto.PostLikeResponse;
import com.example.security.blog.post.Post;
import com.example.security.blog.post.PostRepository;
import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // username = email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public PostLikeResponse likePost(Long postId) {
        User user = getCurrentUser();
        Post post = getPostOrThrow(postId);

        // If already liked, just return status
        if (postLikeRepository.existsByPostAndUser(post, user)) {
            return getStatus(post, user);
        }

        PostLike like = PostLike.builder()
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        postLikeRepository.save(like);

        return getStatus(post, user);
    }

    public PostLikeResponse unlikePost(Long postId) {
        User user = getCurrentUser();
        Post post = getPostOrThrow(postId);

        postLikeRepository.findByPostAndUser(post, user)
                .ifPresent(postLikeRepository::delete);

        return getStatus(post, user);
    }

    public PostLikeResponse getLikeStatus(Long postId) {
        User user = getCurrentUser();
        Post post = getPostOrThrow(postId);

        return getStatus(post, user);
    }

    private PostLikeResponse getStatus(Post post, User user) {
        long count = postLikeRepository.countByPost(post);
        boolean liked = postLikeRepository.existsByPostAndUser(post, user);

        return PostLikeResponse.builder()
                .postId(post.getId())
                .likeCount(count)
                .likedByCurrentUser(liked)
                .build();
    }
}
