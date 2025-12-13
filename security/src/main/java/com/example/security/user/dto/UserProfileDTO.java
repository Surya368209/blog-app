package com.example.security.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    private String accountType;     // STUDENT / TEACHER (as String)
    private String role;            // ADMIN / USER (if you use Role enum)
    private boolean verified;

    private String profileImageUrl; // can be null

    private long followerCount;
    private long followingCount;
}
