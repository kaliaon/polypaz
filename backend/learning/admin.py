from django.contrib import admin
from .models import (
    PlacementTest, PlacementTestItem, PlacementTestResult,
    Roadmap, Module,
    TaskTemplate, TaskInstance, TaskAttempt,
    DialogueScenario, DialogueSession, DialogueTurn,
    ProgressSnapshot, GamificationProfile
)


class PlacementTestItemInline(admin.TabularInline):
    """
    Inline admin for PlacementTestItem within PlacementTest
    """
    model = PlacementTestItem
    extra = 1
    fields = ('order', 'item_type', 'question_text', 'correct_answer', 'options', 'difficulty_weight')
    ordering = ['order']


@admin.register(PlacementTest)
class PlacementTestAdmin(admin.ModelAdmin):
    """
    Admin interface for PlacementTest
    """
    list_display = ('language', 'total_items', 'is_active', 'created_at', 'item_count')
    list_filter = ('language', 'is_active', 'created_at')
    search_fields = ('language',)
    inlines = [PlacementTestItemInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Test Information', {
            'fields': ('language', 'total_items', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def item_count(self, obj):
        """Count of items in this test"""
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(PlacementTestItem)
class PlacementTestItemAdmin(admin.ModelAdmin):
    """
    Admin interface for PlacementTestItem
    """
    list_display = ('test', 'order', 'item_type', 'difficulty_weight', 'created_at')
    list_filter = ('test', 'item_type', 'difficulty_weight')
    search_fields = ('question_text', 'correct_answer')
    ordering = ['test', 'order']

    fieldsets = (
        ('Test', {
            'fields': ('test', 'order')
        }),
        ('Question', {
            'fields': ('item_type', 'question_text', 'correct_answer', 'options')
        }),
        ('Scoring', {
            'fields': ('difficulty_weight',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)


@admin.register(PlacementTestResult)
class PlacementTestResultAdmin(admin.ModelAdmin):
    """
    Admin interface for PlacementTestResult
    """
    list_display = ('user', 'test', 'score', 'max_score', 'percentage', 'estimated_cefr_level', 'completed_at')
    list_filter = ('test', 'estimated_cefr_level', 'completed_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('user', 'test', 'score', 'max_score', 'percentage', 'estimated_cefr_level', 'answers', 'completed_at')
    ordering = ['-completed_at']

    fieldsets = (
        ('User & Test', {
            'fields': ('user', 'test')
        }),
        ('Results', {
            'fields': ('score', 'max_score', 'percentage', 'estimated_cefr_level')
        }),
        ('Answers', {
            'fields': ('answers',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('completed_at',)
        }),
    )

    def has_add_permission(self, request):
        """Disable manual creation of results"""
        return False

    def has_change_permission(self, request, obj=None):
        """Make results read-only"""
        return False


class ModuleInline(admin.TabularInline):
    """
    Inline admin for Module within Roadmap
    """
    model = Module
    extra = 0
    fields = ('order', 'title', 'description', 'is_completed', 'completed_at')
    readonly_fields = ('completed_at',)
    ordering = ['order']


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    """
    Admin interface for Roadmap
    """
    list_display = ('user', 'language', 'cefr_level', 'generated_by_ai', 'is_active', 'created_at', 'module_count')
    list_filter = ('language', 'cefr_level', 'generated_by_ai', 'is_active', 'created_at')
    search_fields = ('user__username', 'user__email')
    inlines = [ModuleInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User & Language', {
            'fields': ('user', 'language', 'cefr_level')
        }),
        ('Roadmap Settings', {
            'fields': ('generated_by_ai', 'is_active')
        }),
        ('Data', {
            'fields': ('roadmap_data',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def module_count(self, obj):
        """Count of modules in this roadmap"""
        return obj.modules.count()
    module_count.short_description = 'Modules'


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    """
    Admin interface for Module
    """
    list_display = ('roadmap', 'order', 'title', 'is_completed', 'completed_at', 'created_at')
    list_filter = ('is_completed', 'created_at', 'roadmap__language')
    search_fields = ('title', 'description', 'roadmap__user__username')
    ordering = ['roadmap', 'order']
    readonly_fields = ('completed_at', 'created_at', 'updated_at')

    fieldsets = (
        ('Roadmap', {
            'fields': ('roadmap', 'order')
        }),
        ('Module Information', {
            'fields': ('title', 'description', 'objectives')
        }),
        ('Completion', {
            'fields': ('checkpoint_criteria', 'is_completed', 'completed_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['check_module_completion']

    def check_module_completion(self, request, queryset):
        """Admin action to check and update module completion status"""
        updated = 0
        for module in queryset:
            if module.check_completion():
                updated += 1
        self.message_user(request, f'{updated} module(s) marked as completed.')
    check_module_completion.short_description = 'Check and update completion status'


@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    """
    Admin interface for TaskTemplate
    """
    list_display = ('module', 'order', 'task_type', 'difficulty_level', 'created_by_ai', 'created_at')
    list_filter = ('task_type', 'difficulty_level', 'created_by_ai', 'module__roadmap__language')
    search_fields = ('content', 'correct_answer', 'module__title')
    ordering = ['module', 'order']
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Module', {
            'fields': ('module', 'order')
        }),
        ('Task Information', {
            'fields': ('task_type', 'content', 'correct_answer', 'difficulty_level')
        }),
        ('Feedback', {
            'fields': ('rule_explanation', 'example_contrast')
        }),
        ('Metadata', {
            'fields': ('created_by_ai', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TaskInstance)
class TaskInstanceAdmin(admin.ModelAdmin):
    """
    Admin interface for TaskInstance
    """
    list_display = ('user', 'template', 'status', 'attempts_count', 'best_attempt_correct', 'created_at')
    list_filter = ('status', 'best_attempt_correct', 'created_at', 'template__module__roadmap__language')
    search_fields = ('user__username', 'user__email', 'template__module__title')
    ordering = ['-created_at']
    readonly_fields = ('attempts_count', 'best_attempt_correct', 'created_at', 'updated_at')

    fieldsets = (
        ('User & Task', {
            'fields': ('user', 'template')
        }),
        ('Status', {
            'fields': ('status', 'attempts_count', 'best_attempt_correct')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class TaskAttemptInline(admin.TabularInline):
    """
    Inline admin for TaskAttempt within TaskInstance
    """
    model = TaskAttempt
    extra = 0
    fields = ('user_answer', 'is_correct', 'xp_gained', 'attempted_at')
    readonly_fields = ('xp_gained', 'attempted_at')
    can_delete = False


@admin.register(TaskAttempt)
class TaskAttemptAdmin(admin.ModelAdmin):
    """
    Admin interface for TaskAttempt
    """
    list_display = ('task_instance', 'is_correct', 'xp_gained', 'attempted_at')
    list_filter = ('is_correct', 'attempted_at', 'task_instance__template__task_type')
    search_fields = ('task_instance__user__username', 'user_answer')
    ordering = ['-attempted_at']
    readonly_fields = ('xp_gained', 'attempted_at')

    fieldsets = (
        ('Task Instance', {
            'fields': ('task_instance',)
        }),
        ('Attempt', {
            'fields': ('user_answer', 'is_correct', 'xp_gained')
        }),
        ('Feedback', {
            'fields': ('feedback',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('attempted_at',)
        }),
    )

    def has_add_permission(self, request):
        """Disable manual creation of attempts"""
        return False


@admin.register(DialogueScenario)
class DialogueScenarioAdmin(admin.ModelAdmin):
    """
    Admin interface for DialogueScenario
    """
    list_display = ('title', 'language', 'cefr_level', 'max_turns', 'created_at')
    list_filter = ('language', 'cefr_level', 'created_at')
    search_fields = ('title', 'context_description')
    ordering = ['language', 'cefr_level', 'title']
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Scenario Information', {
            'fields': ('title', 'language', 'cefr_level')
        }),
        ('Context', {
            'fields': ('context_description', 'max_turns')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class DialogueTurnInline(admin.TabularInline):
    """
    Inline admin for DialogueTurn within DialogueSession
    """
    model = DialogueTurn
    extra = 0
    fields = ('turn_number', 'user_message', 'ai_response', 'has_corrections', 'created_at')
    readonly_fields = ('turn_number', 'has_corrections', 'created_at')
    can_delete = False
    ordering = ['turn_number']

    def has_corrections(self, obj):
        """Check if turn has corrections"""
        if obj.corrections:
            return len(obj.corrections) > 0
        return False
    has_corrections.short_description = 'Has Corrections'
    has_corrections.boolean = True


@admin.register(DialogueSession)
class DialogueSessionAdmin(admin.ModelAdmin):
    """
    Admin interface for DialogueSession
    """
    list_display = ('user', 'scenario', 'status', 'turn_count', 'max_turns', 'started_at', 'ended_at')
    list_filter = ('status', 'scenario__language', 'scenario__cefr_level', 'started_at')
    search_fields = ('user__username', 'user__email', 'scenario__title')
    ordering = ['-started_at']
    readonly_fields = ('turn_count', 'started_at', 'ended_at')
    inlines = [DialogueTurnInline]

    fieldsets = (
        ('User & Scenario', {
            'fields': ('user', 'scenario')
        }),
        ('Session Status', {
            'fields': ('status', 'turn_count', 'started_at', 'ended_at')
        }),
    )

    def max_turns(self, obj):
        """Display max turns from scenario"""
        return obj.scenario.max_turns
    max_turns.short_description = 'Max Turns'


@admin.register(DialogueTurn)
class DialogueTurnAdmin(admin.ModelAdmin):
    """
    Admin interface for DialogueTurn
    """
    list_display = ('session', 'turn_number', 'has_corrections', 'created_at')
    list_filter = ('created_at', 'session__scenario__language')
    search_fields = ('user_message', 'ai_response', 'session__user__username')
    ordering = ['session', 'turn_number']
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Session', {
            'fields': ('session', 'turn_number')
        }),
        ('Messages', {
            'fields': ('user_message', 'ai_response')
        }),
        ('Corrections', {
            'fields': ('corrections', 'reformulation'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

    def has_corrections(self, obj):
        """Check if turn has corrections"""
        if obj.corrections:
            return len(obj.corrections) > 0
        return False
    has_corrections.short_description = 'Has Corrections'
    has_corrections.boolean = True

    def has_add_permission(self, request):
        """Disable manual creation of turns"""
        return False


@admin.register(ProgressSnapshot)
class ProgressSnapshotAdmin(admin.ModelAdmin):
    """
    Admin interface for ProgressSnapshot
    """
    list_display = ('user', 'module', 'tasks_attempted', 'tasks_completed', 'accuracy_percentage', 'last_activity_date', 'snapshot_date')
    list_filter = ('module__roadmap__language', 'last_activity_date', 'snapshot_date')
    search_fields = ('user__username', 'user__email', 'module__title')
    ordering = ['-snapshot_date']
    readonly_fields = ('snapshot_date',)

    fieldsets = (
        ('User & Module', {
            'fields': ('user', 'module')
        }),
        ('Progress Metrics', {
            'fields': ('tasks_attempted', 'tasks_completed', 'accuracy_percentage')
        }),
        ('Dates', {
            'fields': ('last_activity_date', 'snapshot_date')
        }),
    )

    actions = ['recalculate_accuracy']

    def recalculate_accuracy(self, request, queryset):
        """Admin action to recalculate accuracy for selected snapshots"""
        for snapshot in queryset:
            snapshot.calculate_accuracy()
        self.message_user(request, f'{queryset.count()} snapshot(s) recalculated.')
    recalculate_accuracy.short_description = 'Recalculate accuracy'


@admin.register(GamificationProfile)
class GamificationProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for GamificationProfile
    """
    list_display = ('user', 'total_xp', 'current_streak_days', 'longest_streak_days', 'last_activity_date', 'created_at')
    list_filter = ('last_activity_date', 'created_at')
    search_fields = ('user__username', 'user__email')
    ordering = ['-total_xp']
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Experience', {
            'fields': ('total_xp', 'xp_history')
        }),
        ('Streaks', {
            'fields': ('current_streak_days', 'longest_streak_days', 'last_activity_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['reset_streaks']

    def reset_streaks(self, request, queryset):
        """Admin action to reset streaks for selected profiles"""
        queryset.update(current_streak_days=0)
        self.message_user(request, f'{queryset.count()} profile(s) streaks reset.')
    reset_streaks.short_description = 'Reset current streaks'
