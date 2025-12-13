package com.example.security.blog.like;

import com.example.security.blog.post.Post;
import com.example.security.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost(Post post);

    boolean existsByPostAndUser(Post post, User user);

    Optional<PostLike> findByPostAndUser(Post post, User user);

    void deleteByPostAndUser(Post post, User user);

    void deleteByPostId(Long postId);
}
