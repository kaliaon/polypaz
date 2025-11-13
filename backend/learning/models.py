from django.db import models
from django.contrib.auth.models import User
from accounts.models import UserProfile


class PlacementTest(models.Model):
    """
    Placement test definition for a specific language
    """
    LANGUAGE_CHOICES = UserProfile.LANGUAGE_CHOICES

    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Target language for this test"
    )
    total_items = models.IntegerField(
        default=12,
        help_text="Total number of questions in the test (10-12)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this test is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Placement Test'
        verbose_name_plural = 'Placement Tests'
        ordering = ['-created_at']
        unique_together = ['language', 'is_active']

    def __str__(self):
        return f"{self.get_language_display()} Placement Test ({self.total_items} items)"


class PlacementTestItem(models.Model):
    """
    Individual question/item in a placement test
    """
    ITEM_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('cloze', 'Fill in the Blank'),
        ('translation', 'Translation'),
    ]

    test = models.ForeignKey(
        PlacementTest,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        help_text="Type of question"
    )
    question_text = models.JSONField(
        help_text="Question text (supports multilingual content)"
    )
    correct_answer = models.CharField(
        max_length=500,
        help_text="The correct answer"
    )
    options = models.JSONField(
        null=True,
        blank=True,
        help_text="Answer options for multiple choice (JSON array)"
    )
    difficulty_weight = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.0,
        help_text="Weight for scoring (0.5 = easy, 1.0 = medium, 1.5 = hard)"
    )
    order = models.IntegerField(
        default=0,
        help_text="Display order in the test"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Placement Test Item'
        verbose_name_plural = 'Placement Test Items'
        ordering = ['test', 'order']
        unique_together = ['test', 'order']

    def __str__(self):
        return f"{self.test.get_language_display()} - Q{self.order} ({self.get_item_type_display()})"


class PlacementTestResult(models.Model):
    """
    User's placement test results
    """
    CEFR_LEVEL_CHOICES = UserProfile.CEFR_LEVEL_CHOICES

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='placement_results'
    )
    test = models.ForeignKey(
        PlacementTest,
        on_delete=models.CASCADE,
        related_name='results'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Total score achieved"
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Maximum possible score"
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Score percentage"
    )
    estimated_cefr_level = models.CharField(
        max_length=2,
        choices=CEFR_LEVEL_CHOICES,
        help_text="Estimated CEFR level based on test results"
    )
    answers = models.JSONField(
        help_text="User's answers (JSON object mapping question_id to answer)"
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Placement Test Result'
        verbose_name_plural = 'Placement Test Results'
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.test.get_language_display()} ({self.estimated_cefr_level})"

    def save(self, *args, **kwargs):
        """Calculate percentage before saving"""
        if self.max_score > 0:
            self.percentage = (self.score / self.max_score) * 100
        super().save(*args, **kwargs)

        # Update user profile with new CEFR level
        profile = self.user.profile
        if profile.target_language == self.test.language:
            profile.current_cefr_level = self.estimated_cefr_level
            profile.save()


class Roadmap(models.Model):
    """
    Learning roadmap generated for a user
    """
    LANGUAGE_CHOICES = UserProfile.LANGUAGE_CHOICES
    CEFR_LEVEL_CHOICES = UserProfile.CEFR_LEVEL_CHOICES

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Target language for this roadmap"
    )
    cefr_level = models.CharField(
        max_length=2,
        choices=CEFR_LEVEL_CHOICES,
        help_text="CEFR level this roadmap is designed for"
    )
    generated_by_ai = models.BooleanField(
        default=True,
        help_text="Whether this roadmap was AI-generated or manually created"
    )
    roadmap_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Full roadmap structure as JSON (backup)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this is the user's current active roadmap"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Roadmap'
        verbose_name_plural = 'Roadmaps'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_language_display()} ({self.cefr_level})"

    def save(self, *args, **kwargs):
        """Ensure only one active roadmap per user per language"""
        if self.is_active:
            # Deactivate other roadmaps for same user and language
            Roadmap.objects.filter(
                user=self.user,
                language=self.language,
                is_active=True
            ).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class Module(models.Model):
    """
    Individual learning module within a roadmap
    """
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='modules'
    )
    title = models.CharField(
        max_length=200,
        help_text="Module title"
    )
    description = models.TextField(
        help_text="Brief description of the module"
    )
    objectives = models.JSONField(
        default=list,
        help_text="Learning objectives (array of strings)"
    )
    order = models.IntegerField(
        default=0,
        help_text="Display order in the roadmap"
    )
    checkpoint_criteria = models.JSONField(
        default=dict,
        help_text="Criteria for completing this module (e.g., min accuracy, tasks)"
    )
    is_completed = models.BooleanField(
        default=False,
        help_text="Whether the user has completed this module"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the module was completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Module'
        verbose_name_plural = 'Modules'
        ordering = ['roadmap', 'order']
        unique_together = ['roadmap', 'order']

    def __str__(self):
        return f"{self.roadmap.user.username} - {self.title} (Module {self.order})"

    def check_completion(self):
        """
        Check if module completion criteria are met
        Returns True if completed, False otherwise
        """
        criteria = self.checkpoint_criteria

        if not criteria:
            return False

        # Get module progress
        from django.db.models import Avg, Count
        tasks = self.tasks.all()

        if not tasks.exists():
            return False

        # Get task instances for this user
        task_instances = tasks.filter(
            instances__user=self.roadmap.user
        ).distinct()

        # Calculate stats
        total_tasks = task_instances.count()
        completed_tasks = task_instances.filter(
            instances__status='completed',
            instances__user=self.roadmap.user
        ).distinct().count()

        # Get average accuracy from attempts
        from learning.models import TaskAttempt
        attempts = TaskAttempt.objects.filter(
            task_instance__template__module=self,
            task_instance__user=self.roadmap.user,
            is_correct=True
        )

        correct_count = attempts.count()
        total_attempts = TaskAttempt.objects.filter(
            task_instance__template__module=self,
            task_instance__user=self.roadmap.user
        ).count()

        accuracy = (correct_count / total_attempts * 100) if total_attempts > 0 else 0

        # Check criteria
        min_accuracy = criteria.get('accuracy_threshold', 85) * 100
        min_tasks = criteria.get('min_tasks_completed', 10)

        if completed_tasks >= min_tasks and accuracy >= min_accuracy:
            if not self.is_completed:
                from django.utils import timezone
                self.is_completed = True
                self.completed_at = timezone.now()
                self.save()
            return True

        return False


class TaskTemplate(models.Model):
    """
    Reusable task/exercise template
    """
    TASK_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('fill_blank', 'Fill in the Blank'),
        ('translation', 'Translation'),
    ]

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    task_type = models.CharField(
        max_length=20,
        choices=TASK_TYPE_CHOICES,
        help_text="Type of task"
    )
    content = models.JSONField(
        help_text="Task content (question, options, context, etc.)"
    )
    correct_answer = models.CharField(
        max_length=500,
        help_text="The correct answer"
    )
    rule_explanation = models.TextField(
        blank=True,
        help_text="Grammar/vocabulary rule explanation"
    )
    example_contrast = models.TextField(
        blank=True,
        help_text="Example showing correct vs incorrect usage"
    )
    difficulty_level = models.IntegerField(
        default=1,
        help_text="Difficulty level (1=easy, 2=medium, 3=hard)"
    )
    created_by_ai = models.BooleanField(
        default=False,
        help_text="Whether this task was AI-generated"
    )
    order = models.IntegerField(
        default=0,
        help_text="Display order within the module"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Task Template'
        verbose_name_plural = 'Task Templates'
        ordering = ['module', 'order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.title} - Task {self.order} ({self.get_task_type_display()})"


class TaskInstance(models.Model):
    """
    User-specific instance of a task template
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='task_instances'
    )
    template = models.ForeignKey(
        TaskTemplate,
        on_delete=models.CASCADE,
        related_name='instances'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of this task instance"
    )
    attempts_count = models.IntegerField(
        default=0,
        help_text="Number of attempts made"
    )
    best_attempt_correct = models.BooleanField(
        default=False,
        help_text="Whether the best attempt was correct"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Task Instance'
        verbose_name_plural = 'Task Instances'
        ordering = ['-created_at']
        unique_together = ['user', 'template']

    def __str__(self):
        return f"{self.user.username} - {self.template} ({self.status})"


class TaskAttempt(models.Model):
    """
    User's attempt at a task instance
    """
    task_instance = models.ForeignKey(
        TaskInstance,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    user_answer = models.CharField(
        max_length=1000,
        help_text="User's submitted answer"
    )
    is_correct = models.BooleanField(
        help_text="Whether the answer was correct"
    )
    feedback = models.JSONField(
        default=dict,
        help_text="Feedback provided (rule, contrast, tip, etc.)"
    )
    xp_gained = models.IntegerField(
        default=0,
        help_text="XP points earned from this attempt"
    )
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Task Attempt'
        verbose_name_plural = 'Task Attempts'
        ordering = ['-attempted_at']

    def __str__(self):
        status = "✓" if self.is_correct else "✗"
        return f"{status} {self.task_instance.user.username} - {self.task_instance.template}"

    def save(self, *args, **kwargs):
        """Update task instance and award XP on save"""
        # Calculate XP based on correctness and difficulty
        if self.is_correct and self.xp_gained == 0:
            difficulty_multiplier = self.task_instance.template.difficulty_level
            base_xp = 10
            self.xp_gained = base_xp * difficulty_multiplier

        super().save(*args, **kwargs)

        # Update task instance
        instance = self.task_instance
        instance.attempts_count += 1

        # Update status
        if self.is_correct:
            instance.best_attempt_correct = True
            instance.status = 'completed'
        else:
            instance.status = 'in_progress'

        instance.save()

        # Award XP to user's gamification profile
        if self.is_correct:
            from learning.models import GamificationProfile
            profile, created = GamificationProfile.objects.get_or_create(
                user=instance.user
            )
            profile.total_xp += self.xp_gained
            profile.save()


class DialogueScenario(models.Model):
    """
    Dialogue/conversation scenario template
    """
    LANGUAGE_CHOICES = UserProfile.LANGUAGE_CHOICES
    CEFR_LEVEL_CHOICES = UserProfile.CEFR_LEVEL_CHOICES

    title = models.CharField(
        max_length=200,
        help_text="Scenario title (e.g., 'At a Café')"
    )
    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Target language for this scenario"
    )
    cefr_level = models.CharField(
        max_length=2,
        choices=CEFR_LEVEL_CHOICES,
        help_text="Recommended CEFR level"
    )
    context_description = models.TextField(
        help_text="Description of the scenario context"
    )
    max_turns = models.IntegerField(
        default=10,
        help_text="Maximum number of conversation turns"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this scenario is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Dialogue Scenario'
        verbose_name_plural = 'Dialogue Scenarios'
        ordering = ['language', 'cefr_level', 'title']

    def __str__(self):
        return f"{self.title} ({self.get_language_display()} - {self.cefr_level})"


class DialogueSession(models.Model):
    """
    User's dialogue session instance
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='dialogue_sessions'
    )
    scenario = models.ForeignKey(
        DialogueScenario,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Current status of the session"
    )
    turn_count = models.IntegerField(
        default=0,
        help_text="Number of turns completed"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the session ended"
    )

    class Meta:
        verbose_name = 'Dialogue Session'
        verbose_name_plural = 'Dialogue Sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.scenario.title} ({self.status})"

    def can_add_turn(self):
        """Check if more turns can be added"""
        return self.status == 'active' and self.turn_count < self.scenario.max_turns

    def complete_session(self):
        """Mark session as completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.ended_at = timezone.now()
        self.save()


class DialogueTurn(models.Model):
    """
    Individual turn in a dialogue session
    """
    session = models.ForeignKey(
        DialogueSession,
        on_delete=models.CASCADE,
        related_name='turns'
    )
    turn_number = models.IntegerField(
        help_text="Turn number in sequence"
    )
    user_message = models.TextField(
        help_text="Message sent by the user"
    )
    ai_response = models.TextField(
        help_text="AI-generated response"
    )
    corrections = models.JSONField(
        default=list,
        help_text="Inline corrections (array of correction objects)"
    )
    reformulation = models.TextField(
        blank=True,
        help_text="Reformulated/corrected version of user's message"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dialogue Turn'
        verbose_name_plural = 'Dialogue Turns'
        ordering = ['session', 'turn_number']
        unique_together = ['session', 'turn_number']

    def __str__(self):
        return f"{self.session.user.username} - {self.session.scenario.title} - Turn {self.turn_number}"

    def save(self, *args, **kwargs):
        """Update session turn count on save"""
        super().save(*args, **kwargs)

        # Update session turn count
        session = self.session
        session.turn_count = session.turns.count()

        # Check if max turns reached
        if session.turn_count >= session.scenario.max_turns:
            session.complete_session()
        else:
            session.save()


# ==================== Progress & Gamification Models ====================

class ProgressSnapshot(models.Model):
    """
    Tracks user progress metrics per module
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='progress_snapshots'
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='progress_snapshots'
    )
    tasks_attempted = models.IntegerField(
        default=0,
        help_text="Number of tasks attempted in this module"
    )
    tasks_completed = models.IntegerField(
        default=0,
        help_text="Number of tasks completed successfully"
    )
    accuracy_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Overall accuracy percentage for this module"
    )
    last_activity_date = models.DateField(
        null=True,
        blank=True,
        help_text="Last date user worked on this module"
    )
    snapshot_date = models.DateField(
        auto_now=True,
        help_text="Date of this snapshot"
    )

    class Meta:
        verbose_name = 'Progress Snapshot'
        verbose_name_plural = 'Progress Snapshots'
        ordering = ['-snapshot_date']
        unique_together = ['user', 'module']

    def __str__(self):
        return f"{self.user.username} - {self.module.title} - {self.snapshot_date}"

    def calculate_accuracy(self):
        """Calculate and update accuracy percentage based on task attempts"""
        from learning.models import TaskAttempt

        # Get all attempts for this user and module
        attempts = TaskAttempt.objects.filter(
            task_instance__user=self.user,
            task_instance__template__module=self.module
        )

        total_attempts = attempts.count()
        correct_attempts = attempts.filter(is_correct=True).count()

        if total_attempts > 0:
            self.accuracy_percentage = (correct_attempts / total_attempts) * 100
        else:
            self.accuracy_percentage = 0.00

        self.save()


class GamificationProfile(models.Model):
    """
    User gamification profile with XP and streaks
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='gamification'
    )
    total_xp = models.IntegerField(
        default=0,
        help_text="Total experience points earned"
    )
    current_streak_days = models.IntegerField(
        default=0,
        help_text="Current consecutive days of activity"
    )
    longest_streak_days = models.IntegerField(
        default=0,
        help_text="Longest streak ever achieved"
    )
    last_activity_date = models.DateField(
        null=True,
        blank=True,
        help_text="Last date user had activity"
    )
    xp_history = models.JSONField(
        default=dict,
        help_text="History of XP earned per day (date: xp_amount)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Gamification Profile'
        verbose_name_plural = 'Gamification Profiles'

    def __str__(self):
        return f"{self.user.username} - {self.total_xp} XP - {self.current_streak_days} day streak"

    def update_streak(self, activity_date=None):
        """Update daily streak based on activity date"""
        from datetime import date, timedelta

        if activity_date is None:
            activity_date = date.today()

        if self.last_activity_date is None:
            # First activity ever
            self.current_streak_days = 1
            self.longest_streak_days = 1
        else:
            days_diff = (activity_date - self.last_activity_date).days

            if days_diff == 0:
                # Same day, no change to streak
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                self.current_streak_days += 1
                if self.current_streak_days > self.longest_streak_days:
                    self.longest_streak_days = self.current_streak_days
            else:
                # Streak broken, reset to 1
                self.current_streak_days = 1

        self.last_activity_date = activity_date
        self.save()

    def add_xp(self, xp_amount, date=None):
        """Add XP and update XP history"""
        from datetime import date as dt_date

        if date is None:
            date = dt_date.today()

        self.total_xp += xp_amount

        # Update XP history
        date_str = date.isoformat()
        if date_str in self.xp_history:
            self.xp_history[date_str] += xp_amount
        else:
            self.xp_history[date_str] = xp_amount

        self.save()
