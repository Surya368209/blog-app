package com.example.security.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.security.user.entity.User;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Fetch latest notifications for a user
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    // Count unread (Useful for badges later)
    long countByRecipientAndIsReadFalse(User recipient);
}