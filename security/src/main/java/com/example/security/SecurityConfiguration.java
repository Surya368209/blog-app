package com.example.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.example.security.jwt.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CorsConfigurationSource corsConfigurationSource;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 1. Auth endpoints (Login/Register)
                .requestMatchers("/api/v1/auth/**").permitAll()
            
                // 2.ALLOW VIEWING POSTS (Feed, Details, User Profiles)
                // This allows /api/v1/posts, /api/v1/posts/{id}, and /api/v1/posts/users/{id}/posts
                .requestMatchers(HttpMethod.GET, "/api/v1/posts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/feed/**").permitAll() 
                .requestMatchers(HttpMethod.GET, "/api/v1/user/**").permitAll()
            
                // 3.PROTECT ACTIONS (Create, Like, Delete, Comment)
                // Anything that is NOT a GET request requires login
                .requestMatchers(HttpMethod.POST, "/api/v1/posts/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/posts/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/posts/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/user/**").authenticated()
                // 4. Follow Features
                .requestMatchers("/api/v1/follow/**").authenticated()
            
                // 5. Static Images
                .requestMatchers("/profile-images/**").permitAll()
                .requestMatchers("/post-images/**").permitAll()
            
                // 6. Admin & Catch-all
                .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
