package com.example.security.blog.post;

import com.example.security.user.entity.User;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByAuthor(User author);

    // later: findByVisibility, findByAuthorRole, etc.

    //  all posts (students + teachers) newest first
    List<Post> findAllByOrderByCreatedAtDesc();

    //  posts by a list of authors (for following feed)
    List<Post> findByAuthorInOrderByCreatedAtDesc(Collection<User> authors);


    @Query("SELECT p FROM Post p JOIN p.hashtags h WHERE LOWER(h.name) = LOWER(:name)")
    List<Post> findByHashtags_NameIgnoreCase(@Param("name") String name);

    //  1. REAL WORLD TRENDING LOGIC
    // "Count how many posts use this tag, sort descending, give me the top X"
    @Query("SELECT h.name FROM Hashtag h JOIN h.posts p GROUP BY h.name ORDER BY COUNT(p) DESC")
    List<String> findTrendingHashtags(Pageable pageable);
    
    //  2. REAL WORLD POPULAR LOGIC
    // "Count likes for each post, sort descending, give me the top X"
    @Query("SELECT p FROM Post p LEFT JOIN p.likes l GROUP BY p ORDER BY COUNT(l) DESC")
    List<Post> findPopularPosts(Pageable pageable);
}
