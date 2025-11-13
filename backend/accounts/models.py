from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extended user profile for language learning preferences and progress
    """

    LANGUAGE_CHOICES = [
        ('kazakh', 'Kazakh'),
        ('russian', 'Russian'),
        ('english', 'English'),
        ('spanish', 'Spanish'),
    ]

    CEFR_LEVEL_CHOICES = [
        ('A0', 'A0 - Beginner'),
        ('A1', 'A1 - Elementary'),
        ('A2', 'A2 - Pre-Intermediate'),
        ('B1', 'B1 - Intermediate'),
        ('B2', 'B2 - Upper Intermediate'),
        ('C1', 'C1 - Advanced'),
        ('C2', 'C2 - Proficient'),
    ]

    # One-to-one relationship with Django User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Language preferences
    target_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Language the user wants to learn"
    )

    native_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default='english',
        help_text="User's native/primary language"
    )

    # Current proficiency level
    current_cefr_level = models.CharField(
        max_length=2,
        choices=CEFR_LEVEL_CHOICES,
        default='A0',
        help_text="Current CEFR proficiency level"
    )

    # Learning preferences (JSON field for flexibility)
    learning_preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="User learning preferences (study time, goals, etc.)"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - Learning {self.get_target_language_display()}"

    def get_display_level(self):
        """Get human-readable CEFR level"""
        return self.get_current_cefr_level_display()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new User is created
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the UserProfile when User is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save() 