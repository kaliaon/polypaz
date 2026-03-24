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
    """
    Clone tasks from the matching template_bot seed module.
    Tries exact language+level match first, then same language any level,
    then any template with the same module order.
    """
    from learning.models import Roadmap

    language = module.roadmap.language
    cefr_level = module.roadmap.cefr_level

    base_qs = Roadmap.objects.filter(user__username='template_bot')

    template_roadmap = (
        base_qs.filter(language=language, cefr_level=cefr_level).first()
        or base_qs.filter(language=language).first()
        or base_qs.first()
    )

    if template_roadmap:
        template_module = Module.objects.filter(
            roadmap=template_roadmap,
            order=module.order,
        ).first()
        # If no module at this order, grab the first available one
        if not template_module:
            template_module = Module.objects.filter(
                roadmap=template_roadmap,
            ).order_by('order').first()

        if template_module:
            seed_tasks = TaskTemplate.objects.filter(
                module=template_module
            ).order_by('order')

            if seed_tasks.exists():
                return [
                    {
                        'task_type': t.task_type,
                        'content': t.content,
                        'correct_answer': t.correct_answer,
                        'rule_explanation': t.rule_explanation,
                        'example_contrast': t.example_contrast,
                        'difficulty_level': t.difficulty_level,
                    }
                    for t in seed_tasks
                ]

    logger.warning(
        f"No seed tasks for module {module.id} "
        f"({language}/{cefr_level}, order={module.order}). "
        "Run 'manage.py seed_stage_1_data' to populate templates."
    )
    return []
