package com.example.security.notification;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String actorName;
    private String actorImageUrl;
    private String type; // "LIKE", "COMMENT", "FOLLOW"
    private Long actorId;
    private Long relatedPostId;
    private LocalDateTime createdAt;
}