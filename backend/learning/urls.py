from django.urls import path
from .views import (
    # Placement Test Views
    PlacementTestListView,
    PlacementTestDetailView,
    PlacementTestSubmitView,
    PlacementTestResultListView,

    # Roadmap Views
    RoadmapGenerateView,
    RoadmapCurrentView,
    RoadmapModulesView,

    # Task Views
    ModuleTasksView,
    TaskDetailView,
    TaskAttemptView,
    TaskAttemptsListView,

    # Dialogue Views
    DialogueScenarioListView,
    DialogueSessionStartView,
    DialogueSessionDetailView,
    DialogueMessageView,
    DialogueSessionEndView,

    # Progress & Gamification Views
    ProgressOverviewView,
    ModuleProgressView,
    GamificationProfileView,
    DailyCheckInView,
)

app_name = 'learning'

urlpatterns = [
    # ==================== Placement Test Endpoints ====================
    path('placement-tests/', PlacementTestListView.as_view(), name='placement-test-list'),
    path('placement-tests/<int:pk>/', PlacementTestDetailView.as_view(), name='placement-test-detail'),
    path('placement-tests/<int:pk>/submit/', PlacementTestSubmitView.as_view(), name='placement-test-submit'),
    path('placement-tests/results/', PlacementTestResultListView.as_view(), name='placement-test-results'),

    # ==================== Roadmap Endpoints ====================
    path('roadmaps/generate/', RoadmapGenerateView.as_view(), name='roadmap-generate'),
    path('roadmaps/current/', RoadmapCurrentView.as_view(), name='roadmap-current'),
    path('roadmaps/<int:pk>/modules/', RoadmapModulesView.as_view(), name='roadmap-modules'),

    # ==================== Task Endpoints ====================
    path('modules/<int:pk>/tasks/', ModuleTasksView.as_view(), name='module-tasks'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:pk>/attempt/', TaskAttemptView.as_view(), name='task-attempt'),
    path('tasks/attempts/', TaskAttemptsListView.as_view(), name='task-attempts'),

    # ==================== Dialogue Endpoints ====================
    path('dialogue/scenarios/', DialogueScenarioListView.as_view(), name='dialogue-scenarios'),
    path('dialogue/sessions/start/', DialogueSessionStartView.as_view(), name='dialogue-session-start'),
    path('dialogue/sessions/<int:pk>/', DialogueSessionDetailView.as_view(), name='dialogue-session-detail'),
    path('dialogue/sessions/<int:pk>/message/', DialogueMessageView.as_view(), name='dialogue-message'),
    path('dialogue/sessions/<int:pk>/end/', DialogueSessionEndView.as_view(), name='dialogue-session-end'),

    # ==================== Progress & Gamification Endpoints ====================
    path('progress/overview/', ProgressOverviewView.as_view(), name='progress-overview'),
    path('progress/modules/<int:pk>/', ModuleProgressView.as_view(), name='module-progress'),
    path('gamification/profile/', GamificationProfileView.as_view(), name='gamification-profile'),
    path('gamification/daily-check-in/', DailyCheckInView.as_view(), name='daily-check-in'),
]
