from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from learning.models import (
    PlacementTest, PlacementTestItem, Roadmap, Module, 
    TaskTemplate, DialogueScenario, UserProfile
)
from django.utils import timezone
import json

class Command(BaseCommand):
    help = 'Seeds the database with essential Stage 1 mock data (Placement Tests, Roadmaps, Tasks, Dialogues)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))
        
        # 1. Placement Tests
        self.seed_placement_tests()
        
        # 2. Roadmaps & Modules
        self.seed_roadmaps()
        
        # 3. Tasks (associated with Modules)
        self.seed_tasks()
        
        # 4. Dialogue Scenarios
        self.seed_dialogues()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded all Stage 1 data!'))

    def seed_placement_tests(self):
        self.stdout.write('Seeding placement tests...')
        languages = ['english', 'kazakh', 'russian', 'spanish']
        
        for lang in languages:
            test, created = PlacementTest.objects.get_or_create(
                language=lang,
                defaults={'total_items': 10, 'is_active': True}
            )
            
            if created:
                self.create_test_items(test)
                self.stdout.write(f'Created placement test for {lang}')
            else:
                self.stdout.write(f'Placement test for {lang} already exists')

    def create_test_items(self, test):
        # Sample items for English (generic/repeated for others for mock purposes)
        items_data = [
            {
                'type': 'multiple_choice',
                'question': {'text': 'Select the correct greeting for the morning:'},
                'options': ['Good night', 'Good morning', 'Goodbye', 'See you'],
                'correct': 'Good morning',
                'weight': 0.5
            },
            {
                'type': 'multiple_choice',
                'question': {'text': 'I ___ a student.'},
                'options': ['is', 'are', 'am', 'be'],
                'correct': 'am',
                'weight': 0.5
            },
             {
                'type': 'translation',
                'question': {'text': 'Translate "cat"'},
                'options': [],
                'correct': 'cat', # Simplified for mock
                'weight': 0.8
            },
            {
                'type': 'cloze',
                'question': {'text': 'She lives ___ London.'},
                'options': [],
                'correct': 'in',
                'weight': 1.0
            },
             {
                'type': 'multiple_choice',
                'question': {'text': 'Which one is a fruit?'},
                'options': ['Car', 'Apple', 'Dog', 'Table'],
                'correct': 'Apple',
                'weight': 0.5
            },
            {
                'type': 'multiple_choice',
                'question': {'text': 'They ___ playing football now.'},
                'options': ['is', 'are', 'am', 'was'],
                'correct': 'are',
                'weight': 1.0
            },
            {
                'type': 'translation',
                'question': {'text': 'Translate "Thank you"'},
                'options': [],
                'correct': 'Thank you',
                'weight': 0.5
            },
            {
                'type': 'cloze',
                'question': {'text': 'He ___ to school every day.'},
                'options': [],
                'correct': 'goes',
                'weight': 1.2
            },
            {
                'type': 'multiple_choice',
                'question': {'text': 'Yesterday I ___ a movie.'},
                'options': ['watch', 'watched', 'watching', 'watches'],
                'correct': 'watched',
                'weight': 1.2
            },
            {
                'type': 'multiple_choice',
                'question': {'text': 'If I ___ rich, I would buy a boat.'},
                'options': ['am', 'was', 'were', 'been'],
                'correct': 'were',
                'weight': 1.5
            }
        ]

        for idx, item in enumerate(items_data):
            PlacementTestItem.objects.create(
                test=test,
                item_type=item['type'],
                question_text=item['question'],
                correct_answer=item['correct'],
                options=item['options'],
                difficulty_weight=item['weight'],
                order=idx + 1
            )

    def seed_roadmaps(self):
        self.stdout.write('Seeding mock roadmaps...')
        # We'll create a "template" roadmap for each language at A1 level that can be copied/used
        # For the purpose of this mock, we might not assign it to a specific user yet, 
        # OR we create a dummy user to hold these templates if the system requires a user.
        # However, the requirement says "AI generates... or fallback static roadmap loads".
        # The backend likely looks for a Roadmap linked to the user.
        # So we will create "Fallback" roadmaps that the API can clone/use.
        # Since the Roadmap model has a 'user' field, we might need a system/admin user for templates,
        # or we handled this in the API logic.
        # Based on stage_1.md Phase 3.3, "Create fallback static roadmap templates".
        # Let's assume for this seed script we are creating data that will be used 
        # when a user requests a roadmap.
        
        # NOTE: The current Roadmap model requires a User. 
        # We will create a roadmap for the first superuser or a 'template_bot' user if exists.
        
        user, _ = User.objects.get_or_create(username='template_bot', email='template@polypaz.com')
        
        languages = ['english', 'kazakh', 'russian', 'spanish']
        
        for lang in languages:
            # Create an A1 Roadmap Template
            roadmap, created = Roadmap.objects.get_or_create(
                user=user,
                language=lang,
                cefr_level='A1',
                defaults={
                    'generated_by_ai': False,
                    'is_active': False, # It's a template
                    'roadmap_data': {}
                }
            )
            
            if created:
                self.create_modules(roadmap)
                self.stdout.write(f'Created A1 roadmap template for {lang}')

    def create_modules(self, roadmap):
        modules_data = [
            {
                'title': 'Basics & Greetings',
                'description': 'Learn to say hello and introduce yourself.',
                'objectives': ['Say hello/goodbye', 'Introduce yourself', 'Ask "How are you?"'],
                'order': 1
            },
            {
                'title': 'Family & Friends',
                'description': 'Talk about your family members and friends.',
                'objectives': ['Family member names', 'Possessive adjectives', 'Describing people'],
                'order': 2
            },
            {
                'title': 'Daily Routine',
                'description': 'Describe your everyday activities.',
                'objectives': ['Times of day', 'Common verbs', 'Present simple tense'],
                'order': 3
            }
        ]
        
        for m_data in modules_data:
            Module.objects.create(
                roadmap=roadmap,
                title=m_data['title'],
                description=m_data['description'],
                objectives=m_data['objectives'],
                order=m_data['order']
            )

    def seed_tasks(self):
        self.stdout.write('Seeding tasks for roadmap modules...')
        # Find the templates we just created
        user = User.objects.filter(username='template_bot').first()
        if not user:
            return

        roadmaps = Roadmap.objects.filter(user=user)
        
        for roadmap in roadmaps:
            modules = roadmap.modules.all()
            for module in modules:
                if module.tasks.count() == 0:
                    self.create_tasks_for_module(module)

    def create_tasks_for_module(self, module):
        # Generic tasks based on module order
        if module.order == 1: # Greetings
            tasks = [
                {
                    'type': 'multiple_choice',
                    'content': {'question': 'How do you say "Hello"?', 'options': ['Hola', 'Adios', 'Si', 'No']},
                    'correct': 'Hola',
                    'rule': 'Check standard greetings.',
                    'contrast': 'Adios means Goodbye.',
                    'diff': 1
                },
                {
                    'type': 'translation',
                    'content': {'question': 'Translate "Good morning"'},
                    'correct': 'Buenos dias',
                    'rule': 'Used before noon.',
                    'contrast': '',
                    'diff': 1
                },
                 {
                    'type': 'fill_blank',
                    'content': {'question': 'My name ___ John.'},
                    'correct': 'is',
                    'rule': 'Verb to be 3rd person singular.',
                    'contrast': 'Am is for I.',
                    'diff': 1
                },
                 {
                    'type': 'multiple_choice',
                    'content': {'question': 'Nice to ___ you.'},
                    'options': ['meet', 'met', 'meeting', 'meat'],
                    'correct': 'meet',
                    'rule': 'Standard phrase.',
                    'contrast': '',
                    'diff': 1
                },
                 {
                    'type': 'translation',
                    'content': {'question': 'Translate "Goodbye"'},
                    'correct': 'Adios',
                    'rule': 'Standard farewell.',
                    'contrast': '',
                    'diff': 1
                }
            ]
        elif module.order == 2: # Family
            tasks = [
                {
                    'type': 'multiple_choice',
                    'content': {'question': 'My mother\'s brother is my ___.'},
                    'options': ['Uncle', 'Aunt', 'Cousin', 'Father'],
                    'correct': 'Uncle',
                    'rule': 'Family vocabulary.',
                    'contrast': '',
                    'diff': 2
                },
                {
                    'type': 'fill_blank',
                    'content': {'question': 'I ___ two sisters.'},
                    'correct': 'have',
                    'rule': 'Verb to have.',
                    'contrast': 'Has is for he/she/it.',
                    'diff': 2
                },
                {
                    'type': 'translation',
                    'content': {'question': 'Translate "Father"'},
                    'correct': 'Padre',
                    'rule': 'Vocabulary.',
                    'contrast': '',
                    'diff': 1
                }
            ]
        else: # Routine (and fallback for others)
            tasks = [
                {
                    'type': 'multiple_choice',
                    'content': {'question': 'I ___ up at 7 AM.'},
                    'options': ['get', 'got', 'getting', 'gets'],
                    'correct': 'get',
                    'rule': 'Present simple routine.',
                    'contrast': '',
                    'diff': 2
                },
                 {
                    'type': 'fill_blank',
                    'content': {'question': 'She ___ breakfast at 8.'},
                    'correct': 'eats',
                    'rule': 'Third person singular s.',
                    'contrast': '',
                    'diff': 2
                },
                {
                    'type': 'translation',
                    'content': {'question': 'Translate "Sleep"'},
                    'correct': 'Dormir',
                    'rule': 'Vocabulary.',
                    'contrast': '',
                    'diff': 1
                }
            ]

        for idx, t in enumerate(tasks):
            TaskTemplate.objects.create(
                module=module,
                task_type=t['type'],
                content=t['content'],
                correct_answer=t['correct'],
                rule_explanation=t['rule'],
                example_contrast=t['contrast'],
                difficulty_level=t['diff'],
                created_by_ai=False,
                order=idx + 1
            )

    def seed_dialogues(self):
        self.stdout.write('Seeding dialogue scenarios...')
        scenarios = [
            {
                'title': 'At a Café',
                'context': 'You are ordering a coffee and a croissant at a local café.',
                'cefr': 'A1'
            },
            {
                'title': 'Meeting a New Friend',
                'context': 'You meet someone at a park and introduce yourself.',
                'cefr': 'A1'
            },
             {
                'title': 'Asking for Directions',
                'context': 'You are lost in the city and need to find the train station.',
                'cefr': 'A2'
            },
             {
                'title': 'Job Interview',
                'context': 'You are answering basic questions about your experience.',
                'cefr': 'B1'
            }
        ]
        
        languages = ['english', 'kazakh', 'russian', 'spanish']
        
        for lang in languages:
            for sc in scenarios:
                DialogueScenario.objects.get_or_create(
                    title=sc['title'],
                    language=lang,
                    defaults={
                        'cefr_level': sc['cefr'],
                        'context_description': sc['context'],
                        'max_turns': 10,
                        'is_active': True
                    }
                )
        self.stdout.write(f'Created {len(scenarios) * len(languages)} dialogue scenarios')
