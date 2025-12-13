package com.example.security.blog.post.dto;

import lombok.Data;

@Data
public class CreatePostRequest {
    private String title;
    private String content;
    private String imageUrl; //  frontend sends image URL
    private String category; //  optional
}
