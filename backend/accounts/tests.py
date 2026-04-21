from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='test@example.com'
        )

    def test_profile_created_automatically(self):
        """Test that a UserProfile is created automatically when a User is created."""
        self.assertTrue(hasattr(self.user, 'profile'))
        self.assertIsInstance(self.user.profile, UserProfile)
        self.assertEqual(self.user.profile.user, self.user)

    def test_profile_str(self):
        """Test the string representation of UserProfile."""
        self.user.profile.target_language = 'english'
        self.user.profile.save()
        expected_str = f"{self.user.username} - Learning English"
        self.assertEqual(str(self.user.profile), expected_str)

    def test_profile_cefr_level_display(self):
        """Test CEFR level display logic."""
        self.user.profile.current_cefr_level = 'B2'
        self.user.profile.save()
        self.assertEqual(self.user.profile.get_display_level(), 'B2 - Upper Intermediate')

    def test_profile_update(self):
        """Test updating profile fields."""
        profile = self.user.profile
        profile.target_language = 'kazakh'
        profile.native_language = 'english'
        profile.save()
        
        updated_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(updated_profile.target_language, 'kazakh')
        self.assertEqual(updated_profile.native_language, 'english')
