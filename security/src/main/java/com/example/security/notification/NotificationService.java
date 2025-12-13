package com.example.security.notification;

import com.example.security.user.entity.User;
import com.example.security.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public void createNotification(User recipient, User actor, NotificationType type, Long postId) {
        // Don't notify if user likes their own post
        if (recipient.getId().equals(actor.getId())) return;

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .relatedPostId(postId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);

        // Mark all as read when fetched (Simple approach)
        // In a complex app, you'd mark them read only when clicked
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);

        return notifications.stream().map(this::mapToResponse).toList();
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .actorName(n.getActor().getFirstname() + " " + n.getActor().getLastname())
                .actorImageUrl(n.getActor().getProfileImageUrl())
                .actorId(n.getActor().getId()) // AND MAPPED HERE
                .type(n.getType().name())
                .relatedPostId(n.getRelatedPostId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}