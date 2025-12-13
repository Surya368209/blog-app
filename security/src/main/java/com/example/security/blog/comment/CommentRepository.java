package com.example.security.blog.comment;

import com.example.security.blog.post.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost(Post post);

    // later if needed:
    // List<Comment> findByAuthor(User author);
    long countByPost(Post post);

    void deleteByPostId(Long postId);
}
