package com.example.security.config; 

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // ---------------------------------------------------------
        // 1. PROFILE IMAGES CONFIGURATION
        // ---------------------------------------------------------
        Path profileUploadDir = Paths.get("./uploads/profile-images");
        String profilePath = profileUploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/profile-images/**")
                .addResourceLocations("file:/" + profilePath + "/");


        // ---------------------------------------------------------
        // 2. POST IMAGES CONFIGURATION ( NEW ADDITION)
        // ---------------------------------------------------------
        Path postUploadDir = Paths.get("./uploads/post-images");
        String postPath = postUploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/post-images/**")
                .addResourceLocations("file:/" + postPath + "/");
                
        // Optional: Print to console to verify paths on startup
        System.out.println(" Profile Images Path: " + profilePath);
        System.out.println(" Post Images Path:    " + postPath);
    }
}