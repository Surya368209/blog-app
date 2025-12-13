package com.example.security.blog.post;

import com.example.security.blog.comment.Comment;
import com.example.security.blog.hashtag.Hashtag;
import com.example.security.blog.like.PostLike;
import com.example.security.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // Optional image URL for the post
    private String imageUrl;

    // Simple category field for now (could be enum later)
    private String category; // e.g. "NOTICE", "EVENT", "DOUBT", "PLACEMENT"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    // FIX: ADD CASCADE DELETE FOR LIKES
    // "mappedBy = post" refers to the 'private Post post;' field in PostLike.java
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes;

    // FIX: ADD CASCADE DELETE FOR COMMENTS
    // "mappedBy = post" refers to the 'private Post post;' field in Comment.java
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "post_hashtags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    @Builder.Default 
    private Set<Hashtag> hashtags = new HashSet<>();
}