from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    PlacementTest, PlacementTestItem, PlacementTestResult,
    Roadmap, Module,
    TaskTemplate, TaskInstance, TaskAttempt,
    DialogueScenario, DialogueSession, DialogueTurn,
    ProgressSnapshot, GamificationProfile
)


# ==================== Placement Test Serializers ====================

class PlacementTestItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PlacementTestItem
    """
    class Meta:
        model = PlacementTestItem
        fields = [
            'id', 'item_type', 'question_text', 'options',
            'difficulty_weight', 'order'
        ]
        # Exclude correct_answer from regular serialization (will be used for validation)


class PlacementTestSerializer(serializers.ModelSerializer):
    """
    Serializer for PlacementTest with items
    """
    items = PlacementTestItemSerializer(many=True, read_only=True)

    class Meta:
        model = PlacementTest
        fields = ['id', 'language', 'total_items', 'is_active', 'items', 'created_at']
        read_only_fields = ['created_at']


class PlacementTestSubmitSerializer(serializers.Serializer):
    """
    Serializer for submitting placement test answers
    """
    answers = serializers.JSONField(
        help_text="Object mapping item_id to user's answer"
    )

    def validate_answers(self, value):
        """Validate that answers is a dict"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Answers must be a JSON object")
        return value


class PlacementTestResultSerializer(serializers.ModelSerializer):
    """
    Serializer for PlacementTestResult
    """
    test_language = serializers.CharField(source='test.language', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PlacementTestResult
        fields = [
            'id', 'username', 'test', 'test_language',
            'score', 'max_score', 'percentage',
            'estimated_cefr_level', 'answers', 'completed_at'
        ]
        read_only_fields = ['score', 'max_score', 'percentage', 'estimated_cefr_level', 'completed_at']


# ==================== Roadmap Serializers ====================

class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for Module
    """
    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'objectives',
            'order', 'is_completed', 'completed_at',
            'checkpoint_criteria', 'created_at'
        ]
        read_only_fields = ['completed_at', 'created_at']


class RoadmapSerializer(serializers.ModelSerializer):
    """
    Serializer for Roadmap with modules
    """
    modules = ModuleSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Roadmap
        fields = [
            'id', 'username', 'language', 'cefr_level',
            'generated_by_ai', 'is_active', 'modules',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class RoadmapGenerateSerializer(serializers.Serializer):
    """
    Serializer for generating a roadmap
    """
    language = serializers.ChoiceField(
        choices=[('kazakh', 'Kazakh'), ('russian', 'Russian'),
                 ('english', 'English'), ('spanish', 'Spanish')]
    )
    cefr_level = serializers.ChoiceField(
        choices=[('A0', 'A0'), ('A1', 'A1'), ('A2', 'A2'),
                 ('B1', 'B1'), ('B2', 'B2'), ('C1', 'C1'), ('C2', 'C2')]
    )
    use_ai = serializers.BooleanField(default=True)


# ==================== Task Serializers ====================

class TaskTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for TaskTemplate
    """
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = TaskTemplate
        fields = [
            'id', 'module', 'module_title', 'task_type',
            'content', 'difficulty_level', 'order',
            'created_by_ai', 'created_at'
        ]
        # Exclude correct_answer, rule_explanation, example_contrast from list view
        read_only_fields = ['created_at']


class TaskTemplateDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for TaskTemplate (for individual task view)
    """
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = TaskTemplate
        fields = [
            'id', 'module', 'module_title', 'task_type',
            'content', 'difficulty_level', 'order',
            'created_by_ai', 'created_at'
        ]
        # Still exclude correct_answer until submission
        read_only_fields = ['created_at']


class TaskInstanceSerializer(serializers.ModelSerializer):
    """
    Serializer for TaskInstance
    """
    template = TaskTemplateSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TaskInstance
        fields = [
            'id', 'username', 'template', 'status',
            'attempts_count', 'best_attempt_correct',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['attempts_count', 'best_attempt_correct', 'created_at', 'updated_at']


class TaskAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for TaskAttempt
    """
    class Meta:
        model = TaskAttempt
        fields = [
            'id', 'task_instance', 'user_answer',
            'is_correct', 'feedback', 'xp_gained', 'attempted_at'
        ]
        read_only_fields = ['is_correct', 'feedback', 'xp_gained', 'attempted_at']


class TaskAttemptSubmitSerializer(serializers.Serializer):
    """
    Serializer for submitting a task attempt
    """
    user_answer = serializers.CharField(max_length=1000)


# ==================== Dialogue Serializers ====================

class DialogueScenarioSerializer(serializers.ModelSerializer):
    """
    Serializer for DialogueScenario
    """
    class Meta:
        model = DialogueScenario
        fields = [
            'id', 'title', 'language', 'cefr_level',
            'context_description', 'max_turns', 'is_active'
        ]


class DialogueTurnSerializer(serializers.ModelSerializer):
    """
    Serializer for DialogueTurn
    """
    class Meta:
        model = DialogueTurn
        fields = [
            'id', 'turn_number', 'user_message', 'ai_response',
            'corrections', 'reformulation', 'created_at'
        ]
        read_only_fields = ['turn_number', 'ai_response', 'corrections', 'reformulation', 'created_at']


class DialogueSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for DialogueSession
    """
    scenario = DialogueScenarioSerializer(read_only=True)
    turns = DialogueTurnSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = DialogueSession
        fields = [
            'id', 'username', 'scenario', 'status',
            'turn_count', 'turns', 'started_at', 'ended_at'
        ]
        read_only_fields = ['turn_count', 'started_at', 'ended_at']


class DialogueMessageSerializer(serializers.Serializer):
    """
    Serializer for sending a message in dialogue
    """
    message = serializers.CharField(max_length=5000)


# ==================== Progress & Gamification Serializers ====================

class ProgressSnapshotSerializer(serializers.ModelSerializer):
    """
    Serializer for ProgressSnapshot
    """
    module_title = serializers.CharField(source='module.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProgressSnapshot
        fields = [
            'id', 'username', 'module', 'module_title',
            'tasks_attempted', 'tasks_completed',
            'accuracy_percentage', 'last_activity_date', 'snapshot_date'
        ]
        read_only_fields = ['snapshot_date']


class GamificationProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for GamificationProfile
    """
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GamificationProfile
        fields = [
            'id', 'username', 'total_xp', 'current_streak_days',
            'longest_streak_days', 'last_activity_date',
            'xp_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_xp', 'current_streak_days', 'longest_streak_days',
                           'last_activity_date', 'xp_history', 'created_at', 'updated_at']
