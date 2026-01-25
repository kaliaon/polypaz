import logging
from typing import List, Dict, Optional
from django.db import transaction
from .models import Module, TaskTemplate
from utils.gemini_service import gemini_service

logger = logging.getLogger(__name__)

def generate_tasks_for_module(module: Module, use_ai: bool = True) -> int:
    """
    Generate and save tasks for a specific module.
    Tries AI first, then falls back to static templates.
    Returns the number of tasks created.
    """
    language = module.roadmap.language
    cefr_level = module.roadmap.cefr_level
    tasks_data = None

    if use_ai:
        try:
            tasks_data = gemini_service.generate_tasks(
                module_title=module.title,
                module_description=module.description,
                language=language,
                cefr_level=cefr_level,
                count=5
            )
        except Exception as e:
            logger.error(f"AI task generation failed for module {module.id}: {str(e)}")

    if not tasks_data:
        # Fallback to static logic (inspired by seed_tasks.py)
        tasks_data = _get_fallback_tasks(module)

    if not tasks_data:
        logger.warning(f"No tasks generated for module {module.id}")
        return 0

    created_count = 0
    with transaction.atomic():
        # Clear existing tasks if any
        TaskTemplate.objects.filter(module=module).delete()
        
        for index, task in enumerate(tasks_data):
            try:
                TaskTemplate.objects.create(
                    module=module,
                    task_type=task['task_type'],
                    content=task['content'],
                    correct_answer=task['correct_answer'],
                    rule_explanation=task.get('rule_explanation', ''),
                    example_contrast=task.get('example_contrast', ''),
                    difficulty_level=task.get('difficulty_level', 1),
                    order=index + 1,
                    created_by_ai=use_ai and tasks_data is not None
                )
                created_count += 1
            except Exception as e:
                logger.error(f"Error creating task in module {module.id}: {str(e)}")

    return created_count

def _get_fallback_tasks(module: Module) -> List[Dict]:
    """Get static fallback tasks (simplified version of seed_tasks logic)"""
    title = module.title.lower()
    language = module.roadmap.language
    
    # Generic sample tasks if nothing matches
    return [
        {
            'task_type': 'multiple_choice',
            'content': {
                'question': f'Sample question 1 for {module.title}',
                'options': ['Option A', 'Option B', 'Option C', 'Option D']
            },
            'correct_answer': 'Option A',
            'rule_explanation': 'This is a sample task.',
            'example_contrast': 'Correct: A, Incorrect: B',
            'difficulty_level': 1
        },
        {
            'task_type': 'fill_blank',
            'content': {
                'question': f'The ___ is blue.',
                'hint': 'Something high above'
            },
            'correct_answer': 'sky',
            'rule_explanation': 'Vocabulary check.',
            'difficulty_level': 1
        }
    ]
