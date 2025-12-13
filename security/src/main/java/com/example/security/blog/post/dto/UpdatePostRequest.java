package com.example.security.blog.post.dto;

import lombok.Data;

@Data
public class UpdatePostRequest {
    private String title;
    private String content;
    private String imageUrl; // allow changing image
    private String category; // allow changing category
}
