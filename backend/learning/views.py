import logging
from decimal import Decimal
from typing import Dict
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

logger = logging.getLogger(__name__)

from .models import (
    PlacementTest, PlacementTestItem, PlacementTestResult,
    Roadmap, Module,
    TaskTemplate, TaskInstance, TaskAttempt,
    DialogueScenario, DialogueSession, DialogueTurn,
    ProgressSnapshot, GamificationProfile
)
from .serializers import (
    PlacementTestSerializer, PlacementTestSubmitSerializer, PlacementTestResultSerializer,
    RoadmapSerializer, RoadmapGenerateSerializer, ModuleSerializer,
    TaskTemplateSerializer, TaskTemplateDetailSerializer, TaskInstanceSerializer,
    TaskAttemptSerializer, TaskAttemptSubmitSerializer,
    DialogueScenarioSerializer, DialogueSessionSerializer, DialogueTurnSerializer, DialogueMessageSerializer,
    ProgressSnapshotSerializer, GamificationProfileSerializer
)


# ==================== Placement Test Views ====================

class PlacementTestListView(generics.ListAPIView):
    """
    GET /api/placement-tests/
    List all active placement tests, optionally filtered by language
    """
    serializer_class = PlacementTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PlacementTest.objects.filter(is_active=True)
        language = self.request.query_params.get('language', None)
        if language:
            queryset = queryset.filter(language=language)
        return queryset


class PlacementTestDetailView(generics.RetrieveAPIView):
    """
    GET /api/placement-tests/{id}/
    Get specific placement test with all items
    """
    serializer_class = PlacementTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PlacementTest.objects.filter(is_active=True)


class PlacementTestSubmitView(APIView):
    """
    POST /api/placement-tests/{id}/submit/
    Submit placement test answers and get results
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get the test
        test = get_object_or_404(PlacementTest, pk=pk, is_active=True)

        # Validate request data
        serializer = PlacementTestSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']

        # Calculate score and CEFR level
        score, max_score, estimated_level = self._calculate_results(test, answers)

        # Create result record
        result = PlacementTestResult.objects.create(
            user=request.user,
            test=test,
            score=score,
            max_score=max_score,
            estimated_cefr_level=estimated_level,
            answers=answers
        )

        # Return results
        result_serializer = PlacementTestResultSerializer(result)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    def _calculate_results(self, test, answers):
        """
        Calculate score, max score, and estimated CEFR level

        CEFR Level Mapping (based on percentage):
        - A0: 0-20%
        - A1: 21-35%
        - A2: 36-50%
        - B1: 51-65%
        - B2: 66-80%
        - C1: 81-90%
        - C2: 91-100%
        """
        items = test.items.all()
        score = Decimal('0.0')
        max_score = Decimal('0.0')

        for item in items:
            item_weight = item.difficulty_weight
            max_score += item_weight

            # Get user's answer for this item
            user_answer = answers.get(str(item.id), '').strip().lower()
            correct_answer = item.correct_answer.strip().lower()

            # Check if answer is correct
            if self._validate_answer(user_answer, correct_answer, item.item_type):
                score += item_weight

        # Calculate percentage
        percentage = (score / max_score * 100) if max_score > 0 else Decimal('0.0')

        # Determine CEFR level based on percentage
        estimated_level = self._percentage_to_cefr(percentage)

        return score, max_score, estimated_level

    def _validate_answer(self, user_answer, correct_answer, item_type):
        """
        Validate user's answer against correct answer
        Supports different validation strategies based on item type
        """
        if not user_answer:
            return False

        if item_type == 'multiple_choice':
            # Exact match for multiple choice
            return user_answer == correct_answer

        elif item_type == 'cloze':
            # More flexible matching for fill-in-the-blank
            # Accept answer if it matches the correct answer (case-insensitive)
            # Could be enhanced to accept synonyms or variations
            return user_answer == correct_answer

        elif item_type == 'translation':
            # For translations, we do basic string matching
            # In a full implementation, this could use fuzzy matching or AI validation
            return user_answer == correct_answer

        return False

    def _percentage_to_cefr(self, percentage):
        """
        Convert percentage score to CEFR level
        """
        if percentage <= 20:
            return 'A0'
        elif percentage <= 35:
            return 'A1'
        elif percentage <= 50:
            return 'A2'
        elif percentage <= 65:
            return 'B1'
        elif percentage <= 80:
            return 'B2'
        elif percentage <= 90:
            return 'C1'
        else:
            return 'C2'


class PlacementTestResultListView(generics.ListAPIView):
    """
    GET /api/placement-tests/results/
    Get current user's placement test results
    """
    serializer_class = PlacementTestResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlacementTestResult.objects.filter(user=self.request.user)


# ==================== Roadmap Views ====================
# (To be implemented in Phase 3.3)

class RoadmapGenerateView(APIView):
    """
    POST /api/roadmaps/generate/
    Generate a personalized roadmap based on user's level
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from utils.gemini_service import gemini_service

        serializer = RoadmapGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        language = serializer.validated_data['language']
        cefr_level = serializer.validated_data['cefr_level']
        use_ai = serializer.validated_data.get('use_ai', True)

        # Try to generate roadmap with AI
        roadmap_data = None
        generated_by_ai = False

        if use_ai:
            try:
                ai_response = gemini_service.generate_roadmap(
                    language=language,
                    cefr_level=cefr_level,
                    modules_count=3
                )

                if ai_response and 'modules' in ai_response:
                    roadmap_data = ai_response
                    generated_by_ai = True
                else:
                    logger.warning(f"AI roadmap generation failed, using fallback")
            except Exception as e:
                logger.error(f"Error generating AI roadmap: {str(e)}")

        # Use fallback if AI generation failed or was disabled
        if not roadmap_data:
            roadmap_data = self._get_fallback_roadmap(language, cefr_level)
            generated_by_ai = False

        # Create roadmap in database
        with transaction.atomic():
            roadmap = Roadmap.objects.create(
                user=request.user,
                language=language,
                cefr_level=cefr_level,
                generated_by_ai=generated_by_ai,
                roadmap_data=roadmap_data,
                is_active=True
            )

            # Create modules from roadmap data
            for index, module_data in enumerate(roadmap_data['modules']):
                Module.objects.create(
                    roadmap=roadmap,
                    title=module_data['title'],
                    description=module_data['description'],
                    objectives=module_data.get('objectives', []),
                    order=index + 1,
                    checkpoint_criteria=module_data.get('checkpoint_criteria', {
                        'accuracy_threshold': 0.85,
                        'min_tasks_completed': 10
                    })
                )

        # Return created roadmap
        serializer = RoadmapSerializer(roadmap)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _get_fallback_roadmap(self, language: str, cefr_level: str) -> Dict:
        """
        Get static fallback roadmap template
        """
        # Static roadmap templates by language and level
        fallback_templates = {
            'english': {
                'A0': {
                    'modules': [
                        {
                            'title': 'Introduction to English Basics',
                            'description': 'Learn the English alphabet, basic pronunciation, and simple greetings.',
                            'objectives': [
                                'Master the English alphabet and basic sounds',
                                'Learn common greetings and introductions',
                                'Understand basic pronouns (I, you, he, she)',
                                'Form simple present tense sentences'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.80,
                                'min_tasks_completed': 8
                            }
                        },
                        {
                            'title': 'Numbers and Everyday Vocabulary',
                            'description': 'Learn numbers, colors, and common objects in daily life.',
                            'objectives': [
                                'Count from 1 to 100',
                                'Name common colors and objects',
                                'Tell the time (basic)',
                                'Use basic adjectives to describe things'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        },
                        {
                            'title': 'Simple Conversations',
                            'description': 'Practice basic conversational phrases and questions.',
                            'objectives': [
                                'Ask and answer "What is this?"',
                                'Express likes and dislikes',
                                'Form basic yes/no questions',
                                'Use common courtesy phrases'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        }
                    ]
                },
                'A1': {
                    'modules': [
                        {
                            'title': 'Present Tense Mastery',
                            'description': 'Master present simple and present continuous tenses.',
                            'objectives': [
                                'Use present simple for habits and facts',
                                'Form present continuous for ongoing actions',
                                'Understand the difference between the two tenses',
                                'Use time expressions correctly'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 12
                            }
                        },
                        {
                            'title': 'Daily Routines and Activities',
                            'description': 'Learn vocabulary and grammar for describing daily activities.',
                            'objectives': [
                                'Describe your daily routine',
                                'Use frequency adverbs (always, sometimes, never)',
                                'Talk about hobbies and interests',
                                'Ask about others\' routines'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        },
                        {
                            'title': 'Places and Directions',
                            'description': 'Learn to describe locations and give simple directions.',
                            'objectives': [
                                'Use prepositions of place (in, on, at, near)',
                                'Name common places (shop, bank, school)',
                                'Give and follow simple directions',
                                'Use "there is/there are" structures'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        }
                    ]
                },
                'B1': {
                    'modules': [
                        {
                            'title': 'Past Tenses and Storytelling',
                            'description': 'Master past simple and past continuous for narrating events.',
                            'objectives': [
                                'Use past simple for completed actions',
                                'Form past continuous for background actions',
                                'Tell stories about past experiences',
                                'Use past time expressions correctly'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 12
                            }
                        },
                        {
                            'title': 'Making Plans and Future Forms',
                            'description': 'Learn different ways to talk about the future.',
                            'objectives': [
                                'Use "will" for predictions and decisions',
                                'Use "going to" for plans and intentions',
                                'Form present continuous for arrangements',
                                'Express probability and possibility'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        },
                        {
                            'title': 'Expressing Opinions and Preferences',
                            'description': 'Learn to express and justify opinions clearly.',
                            'objectives': [
                                'State opinions using appropriate phrases',
                                'Give reasons and examples',
                                'Agree and disagree politely',
                                'Compare and contrast ideas'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        }
                    ]
                }
            },
            'kazakh': {
                'A0': {
                    'modules': [
                        {
                            'title': 'Kazakh Alphabet and Pronunciation',
                            'description': 'Learn the Kazakh alphabet, special characters, and basic pronunciation.',
                            'objectives': [
                                'Master the 42-letter Kazakh alphabet',
                                'Pronounce special letters (ә, ғ, қ, ң, ө, ұ, ү, h, і)',
                                'Learn basic greetings (Сәлеметсіз бе, Сәлем)',
                                'Understand vowel harmony basics'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.80,
                                'min_tasks_completed': 8
                            }
                        },
                        {
                            'title': 'Basic Grammar and Simple Sentences',
                            'description': 'Learn basic sentence structure and common words.',
                            'objectives': [
                                'Form simple sentences with Subject-Object-Verb order',
                                'Use personal pronouns (мен, сен, ол)',
                                'Learn numbers 1-100',
                                'Use basic question words (кім, не, қайда)'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        },
                        {
                            'title': 'Introduction and Daily Phrases',
                            'description': 'Master essential phrases for daily interactions.',
                            'objectives': [
                                'Introduce yourself (Менің атым...)',
                                'Ask basic questions (Сіздің атыңыз кім?)',
                                'Express gratitude (Рахмет, Үлкен рахмет)',
                                'Use polite forms and courtesy phrases'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        }
                    ]
                },
                'A1': {
                    'modules': [
                        {
                            'title': 'Kazakh Case System Basics',
                            'description': 'Introduction to the Kazakh case system.',
                            'objectives': [
                                'Understand nominative case (basic form)',
                                'Use accusative case for direct objects',
                                'Learn dative-locative case (барамын мектепке)',
                                'Practice ablative case (from)'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 12
                            }
                        },
                        {
                            'title': 'Possessive Forms and Family',
                            'description': 'Learn possessive suffixes and family vocabulary.',
                            'objectives': [
                                'Use possessive endings (менің кітабым)',
                                'Name family members',
                                'Form possessive questions',
                                'Describe family relationships'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        },
                        {
                            'title': 'Present Tense Verbs',
                            'description': 'Master present tense verb conjugations.',
                            'objectives': [
                                'Conjugate verbs in present continuous (оқып жатырмын)',
                                'Use simple present tense (оқимын)',
                                'Form negative sentences',
                                'Ask yes/no questions with verbs'
                            ],
                            'checkpoint_criteria': {
                                'accuracy_threshold': 0.85,
                                'min_tasks_completed': 10
                            }
                        }
                    ]
                }
            }
        }

        # Get template or return generic fallback
        template = fallback_templates.get(language, {}).get(cefr_level, {
            'modules': [
                {
                    'title': f'{language.title()} Module 1',
                    'description': f'Introduction to {language.title()} at {cefr_level} level',
                    'objectives': ['Learn basic vocabulary', 'Practice grammar', 'Improve comprehension'],
                    'checkpoint_criteria': {'accuracy_threshold': 0.85, 'min_tasks_completed': 10}
                },
                {
                    'title': f'{language.title()} Module 2',
                    'description': f'Intermediate {language.title()} at {cefr_level} level',
                    'objectives': ['Expand vocabulary', 'Master key grammar', 'Develop fluency'],
                    'checkpoint_criteria': {'accuracy_threshold': 0.85, 'min_tasks_completed': 10}
                },
                {
                    'title': f'{language.title()} Module 3',
                    'description': f'Advanced {language.title()} at {cefr_level} level',
                    'objectives': ['Apply knowledge', 'Practice conversation', 'Achieve proficiency'],
                    'checkpoint_criteria': {'accuracy_threshold': 0.85, 'min_tasks_completed': 10}
                }
            ]
        })

        return template


class RoadmapCurrentView(APIView):
    """
    GET /api/roadmaps/current/
    Get user's current active roadmap
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get user's active roadmap
        try:
            roadmap = Roadmap.objects.get(user=request.user, is_active=True)
            serializer = RoadmapSerializer(roadmap)
            return Response(serializer.data)
        except Roadmap.DoesNotExist:
            return Response(
                {"detail": "No active roadmap found. Please generate a roadmap first."},
                status=status.HTTP_404_NOT_FOUND
            )


class RoadmapModulesView(generics.ListAPIView):
    """
    GET /api/roadmaps/{id}/modules/
    List modules for a specific roadmap
    """
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        roadmap_id = self.kwargs.get('pk')
        return Module.objects.filter(roadmap_id=roadmap_id, roadmap__user=self.request.user)


# ==================== Task Views ====================
# (To be implemented in Phase 3.4)

class ModuleTasksView(generics.ListAPIView):
    """
    GET /api/modules/{id}/tasks/
    List tasks for a specific module
    """
    serializer_class = TaskTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        module_id = self.kwargs.get('pk')
        # Verify module belongs to user's roadmap
        module = get_object_or_404(Module, pk=module_id, roadmap__user=self.request.user)
        return TaskTemplate.objects.filter(module=module).order_by('order')


class TaskDetailView(generics.RetrieveAPIView):
    """
    GET /api/tasks/{id}/
    Get specific task details
    """
    serializer_class = TaskTemplateDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return tasks from modules in user's roadmaps
        return TaskTemplate.objects.filter(module__roadmap__user=self.request.user)


class TaskAttemptView(APIView):
    """
    POST /api/tasks/{id}/attempt/
    Submit answer for a task
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from utils.gemini_service import gemini_service
        from datetime import date

        # Get task template
        task_template = get_object_or_404(
            TaskTemplate,
            pk=pk,
            module__roadmap__user=request.user
        )

        # Validate request data
        serializer = TaskAttemptSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_answer = serializer.validated_data['user_answer'].strip()

        # Get or create task instance
        task_instance, created = TaskInstance.objects.get_or_create(
            user=request.user,
            template=task_template,
            defaults={'status': 'in_progress'}
        )

        # Evaluate answer
        is_correct = self._evaluate_answer(
            user_answer,
            task_template.correct_answer,
            task_template.task_type
        )

        # Generate feedback
        feedback = self._generate_feedback(
            task_template=task_template,
            user_answer=user_answer,
            is_correct=is_correct,
            use_ai=True
        )

        # Create task attempt (this will auto-update instance and award XP)
        with transaction.atomic():
            attempt = TaskAttempt.objects.create(
                task_instance=task_instance,
                user_answer=user_answer,
                is_correct=is_correct,
                feedback=feedback
            )

            # Update gamification profile
            gamification_profile, _ = GamificationProfile.objects.get_or_create(
                user=request.user
            )
            gamification_profile.update_streak(date.today())

            # Update progress snapshot
            self._update_progress_snapshot(request.user, task_template.module)

        # Return response
        attempt_serializer = TaskAttemptSerializer(attempt)
        return Response(attempt_serializer.data, status=status.HTTP_201_CREATED)

    def _evaluate_answer(self, user_answer: str, correct_answer: str, task_type: str) -> bool:
        """
        Evaluate if user's answer is correct
        """
        user_answer = user_answer.lower().strip()
        correct_answer = correct_answer.lower().strip()

        if task_type == 'multiple_choice':
            # Exact match for multiple choice
            return user_answer == correct_answer

        elif task_type == 'fill_blank':
            # More flexible matching for fill-in-the-blank
            # Remove extra spaces and punctuation
            import re
            user_answer = re.sub(r'[^\w\s]', '', user_answer)
            correct_answer = re.sub(r'[^\w\s]', '', correct_answer)
            return user_answer == correct_answer

        elif task_type == 'translation':
            # For translations, we use fuzzy matching
            # Accept answer if it's close enough (80% similarity)
            from difflib import SequenceMatcher
            similarity = SequenceMatcher(None, user_answer, correct_answer).ratio()
            return similarity >= 0.8

        return False

    def _generate_feedback(
        self,
        task_template: TaskTemplate,
        user_answer: str,
        is_correct: bool,
        use_ai: bool = True
    ) -> Dict:
        """
        Generate feedback for the user's answer
        """
        if is_correct:
            # Positive feedback for correct answers
            return {
                'message': 'Correct! Well done!',
                'is_correct': True,
                'correct_answer': task_template.correct_answer,
                'rule': task_template.rule_explanation or 'Great job!',
                'example_contrast': task_template.example_contrast or ''
            }

        # For incorrect answers, try to generate AI feedback
        feedback = {
            'message': 'Not quite right. Here\'s some help:',
            'is_correct': False,
            'correct_answer': task_template.correct_answer,
            'rule': task_template.rule_explanation or '',
            'example_contrast': task_template.example_contrast or ''
        }

        # Try AI-powered feedback if enabled
        if use_ai:
            try:
                ai_feedback = gemini_service.generate_task_feedback(
                    user_answer=user_answer,
                    correct_answer=task_template.correct_answer,
                    task_type=task_template.task_type,
                    context=task_template.content.get('question', '')
                )

                if ai_feedback:
                    feedback['rule'] = ai_feedback.get('rule', feedback['rule'])
                    feedback['example_contrast'] = ai_feedback.get('example_contrast', feedback['example_contrast'])
                    if 'tip' in ai_feedback:
                        feedback['tip'] = ai_feedback['tip']
            except Exception as e:
                logger.error(f"Error generating AI feedback: {str(e)}")

        return feedback

    def _update_progress_snapshot(self, user, module):
        """
        Update progress snapshot for the module
        """
        from datetime import date
        from django.db.models import Count, Q

        snapshot, created = ProgressSnapshot.objects.get_or_create(
            user=user,
            module=module
        )

        # Recalculate progress
        snapshot.calculate_accuracy()

        # Update task counts
        task_stats = TaskInstance.objects.filter(
            user=user,
            template__module=module
        ).aggregate(
            attempted=Count('id'),
            completed=Count('id', filter=Q(status='completed'))
        )

        snapshot.tasks_attempted = task_stats['attempted']
        snapshot.tasks_completed = task_stats['completed']
        snapshot.last_activity_date = date.today()
        snapshot.save()


class TaskAttemptsListView(generics.ListAPIView):
    """
    GET /api/tasks/attempts/
    Get user's task attempts history
    """
    serializer_class = TaskAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskAttempt.objects.filter(task_instance__user=self.request.user)


# ==================== Dialogue Views ====================
# (To be implemented in Phase 3.5)

class DialogueScenarioListView(generics.ListAPIView):
    """
    GET /api/dialogue/scenarios/
    List available dialogue scenarios
    """
    serializer_class = DialogueScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DialogueScenario.objects.filter(is_active=True)


class DialogueSessionStartView(APIView):
    """
    POST /api/dialogue/sessions/start/
    Start a new dialogue session
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Get scenario_id from request
        scenario_id = request.data.get('scenario_id')
        if not scenario_id:
            return Response(
                {"scenario_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get scenario
        scenario = get_object_or_404(DialogueScenario, pk=scenario_id, is_active=True)

        # Create new session
        session = DialogueSession.objects.create(
            user=request.user,
            scenario=scenario,
            status='active'
        )

        # Return session data
        serializer = DialogueSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DialogueSessionDetailView(generics.RetrieveAPIView):
    """
    GET /api/dialogue/sessions/{id}/
    Get dialogue session history
    """
    serializer_class = DialogueSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DialogueSession.objects.filter(user=self.request.user)


class DialogueMessageView(APIView):
    """
    POST /api/dialogue/sessions/{id}/message/
    Send a message in dialogue session
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from utils.gemini_service import gemini_service

        # Get session
        session = get_object_or_404(
            DialogueSession,
            pk=pk,
            user=request.user,
            status='active'
        )

        # Check if session can accept more turns
        if not session.can_add_turn():
            return Response(
                {"detail": "Session has reached maximum turns or is completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate message
        serializer = DialogueMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']

        # Get conversation history
        conversation_history = self._get_conversation_history(session)

        # Get user's CEFR level
        user_profile = request.user.profile
        cefr_level = user_profile.current_cefr_level

        # Generate AI response with corrections
        ai_data = gemini_service.generate_dialogue_response(
            scenario_context=session.scenario.context_description,
            conversation_history=conversation_history,
            user_message=user_message,
            target_language=session.scenario.language,
            cefr_level=cefr_level
        )

        if not ai_data:
            # Fallback response if AI fails
            ai_data = {
                'ai_response': 'I understand. Please continue.',
                'corrections': [],
                'reformulation': ''
            }

        # Create dialogue turn
        with transaction.atomic():
            turn = DialogueTurn.objects.create(
                session=session,
                turn_number=session.turn_count + 1,
                user_message=user_message,
                ai_response=ai_data.get('ai_response', ''),
                corrections=ai_data.get('corrections', []),
                reformulation=ai_data.get('reformulation', '')
            )

        # Return turn data
        turn_serializer = DialogueTurnSerializer(turn)
        return Response(turn_serializer.data, status=status.HTTP_201_CREATED)

    def _get_conversation_history(self, session):
        """Get conversation history for context"""
        turns = session.turns.all().order_by('turn_number')
        history = []
        for turn in turns:
            history.append({'role': 'user', 'content': turn.user_message})
            history.append({'role': 'assistant', 'content': turn.ai_response})
        return history


class DialogueSessionEndView(APIView):
    """
    POST /api/dialogue/sessions/{id}/end/
    End a dialogue session
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get session
        session = get_object_or_404(
            DialogueSession,
            pk=pk,
            user=request.user,
            status='active'
        )

        # Complete the session
        session.complete_session()

        # Return updated session
        serializer = DialogueSessionSerializer(session)
        return Response(serializer.data)


# ==================== Progress Views ====================
# (To be implemented in Phase 3.6)

class ProgressOverviewView(APIView):
    """
    GET /api/progress/overview/
    Get overall progress summary
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # TODO: Implement in Phase 3.6
        return Response(
            {"message": "Progress overview endpoint - to be implemented in Phase 3.6"},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class ModuleProgressView(generics.RetrieveAPIView):
    """
    GET /api/progress/modules/{id}/
    Get module-specific progress
    """
    serializer_class = ProgressSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProgressSnapshot.objects.filter(user=self.request.user)


class GamificationProfileView(generics.RetrieveAPIView):
    """
    GET /api/gamification/profile/
    Get user's gamification profile (XP, streaks)
    """
    serializer_class = GamificationProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = GamificationProfile.objects.get_or_create(user=self.request.user)
        return profile


class DailyCheckInView(APIView):
    """
    POST /api/gamification/daily-check-in/
    Record daily activity for streak tracking
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # TODO: Implement in Phase 3.6
        return Response(
            {"message": "Daily check-in endpoint - to be implemented in Phase 3.6"},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
