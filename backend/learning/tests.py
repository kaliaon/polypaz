from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from accounts.models import UserProfile
from .models import PlacementTest, PlacementTestItem, PlacementTestResult, Roadmap, Module

class LearningTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testlearner',
            password='testpassword123'
        )
        # Profile is created by signal
        self.profile = self.user.profile
        self.profile.target_language = 'spanish'
        self.profile.save()

        self.test = PlacementTest.objects.create(
            language='spanish',
            total_items=10
        )

    def test_placement_test_item_creation(self):
        """Test creating a placement test item."""
        item = PlacementTestItem.objects.create(
            test=self.test,
            item_type='multiple_choice',
            question_text={'en': 'How are you?', 'es': '¿Cómo estás?'},
            correct_answer='Fine',
            order=1
        )
        self.assertEqual(self.test.items.count(), 1)
        self.assertEqual(item.test, self.test)

    def test_placement_test_result_logic(self):
        """Test that result saving updates percentage and user profile."""
        result = PlacementTestResult.objects.create(
            user=self.user,
            test=self.test,
            score=8.0,
            max_score=10.0,
            estimated_cefr_level='A2',
            answers={}
        )
        
        # Check percentage calculation (handled in save method)
        self.assertEqual(result.percentage, Decimal('80.00'))
        
        # Check user profile update (handled in save method)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.current_cefr_level, 'A2')

    def test_roadmap_and_module_creation(self):
        """Test roadmap and module relationship."""
        roadmap = Roadmap.objects.create(
            user=self.user,
            language='spanish',
            cefr_level='A2'
        )
        
        module = Module.objects.create(
            roadmap=roadmap,
            title='Basics',
            description='Basic greetings',
            order=1
        )
        
        self.assertEqual(roadmap.modules.count(), 1)
        self.assertEqual(module.roadmap, roadmap)
        self.assertTrue(roadmap.is_active)

    def test_only_one_active_roadmap(self):
        """Test that only one roadmap is active per user and language."""
        roadmap1 = Roadmap.objects.create(
            user=self.user,
            language='spanish',
            cefr_level='A1',
            is_active=True
        )
        
        roadmap2 = Roadmap.objects.create(
            user=self.user,
            language='spanish',
            cefr_level='A2',
            is_active=True
        )
        
        roadmap1.refresh_from_db()
        self.assertFalse(roadmap1.is_active)
        self.assertTrue(roadmap2.is_active)
