package com.example.security.user.follow;

import com.example.security.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    List<Follow> findByFollower(User follower);

    Long countByFollowing(User user);

    List<Follow> findByFollowing(User following);

    long countByFollower(User follower);
}
