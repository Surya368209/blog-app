package com.example.security.blog.feed;

import com.example.security.blog.comment.CommentRepository;
import com.example.security.blog.like.PostLikeRepository;
import com.example.security.blog.post.Post;
import com.example.security.blog.post.PostRepository;
import com.example.security.blog.post.dto.PostResponse;
import com.example.security.user.AccountType;
import com.example.security.user.entity.User;
import com.example.security.user.follow.Follow;
import com.example.security.user.follow.FollowRepository;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private PostResponse mapToResponse(Post post) {
        User author = post.getAuthor();
        User currentUser = getCurrentUser();
        String fullName = (author.getLastname() + " " + author.getFirstname()).trim();
        String authorImageURL = author.getProfileImageUrl();

        long likeCount = postLikeRepository.countByPost(post);
        boolean likedByCurrentUser = postLikeRepository.existsByPostAndUser(post, currentUser);

        long commentCount = commentRepository.countByPost(post);
        
        boolean followingAuthor = false;
    if (currentUser.getAccountType() == AccountType.STUDENT
            && author.getAccountType() == AccountType.TEACHER) {
        followingAuthor = followRepository.existsByFollowerAndFollowing(currentUser, author);
    }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .category(post.getCategory())
                .authorName(fullName)
                .authorImageUrl(authorImageURL)
                .authorRole(author.getAccountType() != null ? author.getAccountType().name() : "STUDENT")
                .authorVerified(author.isVerified())
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .commentCount(commentCount)
                .authorId(author.getId())
                .followingAuthor(followingAuthor)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    // 1) all posts from everyone (teachers + students)
    public List<PostResponse> getAllFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 2) posts only from teachers that the current student follows
    public List<PostResponse> getFollowingFeed() {
        User current = getCurrentUser();

        // get all teachers this user follows
        List<User> followedTeachers = followRepository.findByFollower(current)
                .stream()
                .map(Follow::getFollowing)
                .toList();

        if (followedTeachers.isEmpty()) {
            return List.of();
        }

        return postRepository.findByAuthorInOrderByCreatedAtDesc(followedTeachers)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}
