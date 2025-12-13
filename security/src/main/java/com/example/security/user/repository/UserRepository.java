package com.example.security.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.security.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    List<User> findByFirstnameContainingIgnoreCaseOrLastnameContainingIgnoreCase(String firstname, String lastname);

    // NATIVE QUERY FOR RANDOM SELECTION (Works for MySQL)
    @Query(value = "SELECT * FROM _user WHERE account_type = 'TEACHER' AND verified = true ORDER BY RAND() LIMIT 2", nativeQuery = true)
    List<User> findRandomVerifiedTeachers();
}
