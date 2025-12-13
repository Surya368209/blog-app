package com.example.security.auth.dto;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String token;
    private String newPassword;
}