package com.example.security.blog.like.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostLikeResponse {
    private Long postId;
    private long likeCount;
    private boolean likedByCurrentUser;
}
