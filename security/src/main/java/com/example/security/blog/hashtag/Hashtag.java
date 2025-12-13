package com.example.security.blog.hashtag;

import com.example.security.blog.post.Post;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hashtags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "java" (stored without #)

    @ManyToMany(mappedBy = "hashtags")
    @Builder.Default
    private Set<Post> posts = new HashSet<>();
}