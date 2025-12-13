package com.example.security.blog.post;

import com.example.security.blog.comment.CommentRepository;
import com.example.security.blog.hashtag.Hashtag;
import com.example.security.blog.hashtag.HashtagRepository;
import com.example.security.blog.like.PostLike;
import com.example.security.blog.like.PostLikeRepository;
import com.example.security.blog.post.dto.CreatePostRequest;
import com.example.security.blog.post.dto.UpdatePostRequest;
import com.example.security.notification.NotificationService;
import com.example.security.notification.NotificationType;
import com.example.security.blog.post.dto.PostResponse;
import com.example.security.user.AccountType;
import com.example.security.user.entity.User;
import com.example.security.user.follow.FollowRepository;
import com.example.security.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final FollowRepository followRepository; 
    private final HashtagRepository hashtagRepository;
    private final NotificationService notificationService;

    // Strict User Fetch (For actions like Create/Update/Delete)
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Optional User Fetch (For viewing posts publicly)
    private User getOptionalCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null; 
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    public String uploadPostImage(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File is empty");
        try {
            String uploadDir = "uploads/post-images/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String original = file.getOriginalFilename();
            String safeName = (original != null ? original.replaceAll("\\s+", "_") : "image.jpg");
            String filename = UUID.randomUUID() + "_" + safeName;

            Path filePath = Paths.get(uploadDir + filename);
            Files.write(filePath, file.getBytes());
            return "/post-images/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public PostResponse createPost(CreatePostRequest request) {
        User author = getCurrentUser(); // Strict check

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .author(author)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        post.setHashtags(parseHashtags(request.getContent()));

        Post saved = postRepository.save(post);
        //  Pass author as currentUser (since they just created it)
        return mapToResponse(saved, author);
    }

    public List<PostResponse> getAllPosts() {
        //  Optimization: Fetch user ONCE
        User currentUser = getOptionalCurrentUser(); 
        
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> mapToResponse(post, currentUser)) //  Pass user
                .toList();
    }

    public List<PostResponse> getPostsByUserId(Long userId) {
        User currentUser = getOptionalCurrentUser(); // Fetch once

        return postRepository.findAll().stream()
                .filter(post -> post.getAuthor().getId().equals(userId))
                .map(post -> mapToResponse(post, currentUser)) //  Pass user
                .collect(Collectors.toList());
    }

    public PostResponse getPostById(Long id) {
        User currentUser = getOptionalCurrentUser(); // Fetch user
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToResponse(post, currentUser); //  Pass user
    }

    public PostResponse updatePost(Long id, UpdatePostRequest request) {
        User currentUser = getCurrentUser(); // Strict check

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not allowed to edit this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setCategory(request.getCategory());
        post.setUpdatedAt(LocalDateTime.now());
        post.setHashtags(parseHashtags(request.getContent()));

        Post updated = postRepository.save(post);
        return mapToResponse(updated, currentUser); //  Pass user
    }

    @Transactional
    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) throw new RuntimeException("Post not found");
        postLikeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.deleteById(postId);
    }

    private Set<Hashtag> parseHashtags(String content) {
        Set<Hashtag> tags = new HashSet<>();
        if (content == null) return tags;
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("#(\\w+)").matcher(content);
        while (matcher.find()) {
            String tagName = matcher.group(1).toLowerCase();
            Hashtag hashtag = hashtagRepository.findByName(tagName)
                    .orElseGet(() -> hashtagRepository.save(Hashtag.builder().name(tagName).build()));
            tags.add(hashtag);
        }
        return tags;
    }

    public List<PostResponse> searchPostsByTag(String tag) {
        if (tag == null || tag.isEmpty()) return List.of();
        
        User currentUser = getOptionalCurrentUser(); // Fetch once

        return postRepository.findByHashtags_NameIgnoreCase(tag).stream()
                .map(post -> mapToResponse(post, currentUser)) // Pass user
                .toList();
    }

    public List<String> getTrendingTags() {
        return postRepository.findTrendingHashtags(PageRequest.of(0, 10));
    }

    public List<PostResponse> getPopularPosts() {
        User currentUser = getOptionalCurrentUser(); //  Fetch once
        return postRepository.findPopularPosts(PageRequest.of(0, 20)).stream()
                .map(post -> mapToResponse(post, currentUser)) //  Pass user
                .toList();
    }

    @Transactional
    public void toggleLike(Long postId) {
        User currentUser = getCurrentUser(); // Strict check (must be logged in)
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<PostLike> existingLike = postLikeRepository.findByPostAndUser(post, currentUser);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get()); // Unlike
        } else {
            postLikeRepository.save(PostLike.builder().post(post).user(currentUser).build()); // Like
            
            // TRIGGER NOTIFICATION
            notificationService.createNotification(
                post.getAuthor(),       // Recipient (Post Owner)
                currentUser,            // Actor (Who liked)
                NotificationType.LIKE, 
                post.getId()            // Related Post ID
            );
        }
    }
    // The Optimized Mapper (Requires User to be passed in)
    private PostResponse mapToResponse(Post post, User currentUser) {
        User author = post.getAuthor();
        String fullName = (author.getLastname() + " " + author.getFirstname()).trim();
        
        // These still cause queries (resolved by Batch Fetching setting)
        long likeCount = postLikeRepository.countByPost(post);
        long commentCount = commentRepository.countByPost(post);

        boolean likedByCurrentUser = (currentUser != null) && postLikeRepository.existsByPostAndUser(post, currentUser);
        
        boolean followingAuthor = false;
        if (currentUser != null && currentUser.getAccountType() == AccountType.STUDENT 
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
                .authorImageUrl(author.getProfileImageUrl())
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
}