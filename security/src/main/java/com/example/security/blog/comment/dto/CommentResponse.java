package com.example.security.blog.comment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private String content;

    private Long postId;

    private Long authorId;
    private String authorName;
    private String authorRole;
    private boolean authorVerified;

    private LocalDateTime createdAt;
    private String authorImageUrl; 

}
