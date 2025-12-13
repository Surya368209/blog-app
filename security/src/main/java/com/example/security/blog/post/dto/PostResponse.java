package com.example.security.blog.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;

    private String title;
    private String content;
    private String imageUrl;
    private String category;


    private String authorName;
    private String authorRole;       // e.g. TEACHER / STUDENT
    private boolean authorVerified;
    private String authorImageUrl;

    private Long authorId;
    private Boolean followingAuthor; //student following teacher

    private Long likeCount;          //  NEW
    private Boolean likedByCurrentUser; //  NEW

    private Long commentCount;  

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
