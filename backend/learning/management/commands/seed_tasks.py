from django.core.management.base import BaseCommand
from learning.models import Module, TaskTemplate


class Command(BaseCommand):
    help = 'Seed sample tasks for existing modules'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding sample tasks...')

        # Get all modules
        modules = Module.objects.all()

        if not modules.exists():
            self.stdout.write(self.style.WARNING('No modules found. Please create a roadmap first.'))
            return

        # Create tasks for each module
        for module in modules:
            self._create_tasks_for_module(module)

        self.stdout.write(self.style.SUCCESS('Successfully seeded sample tasks!'))

    def _create_tasks_for_module(self, module):
        """Create sample tasks based on module title and language"""

        # Delete existing tasks for this module
        TaskTemplate.objects.filter(module=module).delete()

        language = module.roadmap.language
        module_title_lower = module.title.lower()

        # Determine which tasks to create based on module title
        if 'present tense' in module_title_lower or 'tense mastery' in module_title_lower:
            self._create_present_tense_tasks(module, language)
        elif 'alphabet' in module_title_lower or 'pronunciation' in module_title_lower:
            self._create_alphabet_tasks(module, language)
        elif 'basic' in module_title_lower or 'introduction' in module_title_lower:
            self._create_basic_tasks(module, language)
        elif 'daily' in module_title_lower or 'routine' in module_title_lower:
            self._create_daily_routine_tasks(module, language)
        elif 'case system' in module_title_lower:
            self._create_case_system_tasks(module, language)
        else:
            # Generic tasks
            self._create_generic_tasks(module, language)

        task_count = TaskTemplate.objects.filter(module=module).count()
        self.stdout.write(f'  Created {task_count} tasks for module: {module.title}')

    def _create_present_tense_tasks(self, module, language):
        """Create present tense tasks"""
        if language == 'english':
            tasks = [
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'She ___ to school every day.',
                        'options': ['go', 'goes', 'going', 'gone']
                    },
                    'correct_answer': 'goes',
                    'rule_explanation': 'In present simple, third person singular (he/she/it) takes -s or -es',
                    'example_contrast': 'Correct: She goes. Incorrect: She go.',
                    'difficulty_level': 1,
                    'order': 1
                },
                {
                    'task_type': 'fill_blank',
                    'content': {
                        'question': 'I ___ (watch) TV right now.',
                        'hint': 'Present continuous'
                    },
                    'correct_answer': 'am watching',
                    'rule_explanation': 'Present continuous: am/is/are + verb-ing for actions happening now',
                    'example_contrast': 'Correct: I am watching TV now. Incorrect: I watch TV now.',
                    'difficulty_level': 2,
                    'order': 2
                },
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'They ___ football every Saturday.',
                        'options': ['play', 'plays', 'playing', 'are playing']
                    },
                    'correct_answer': 'play',
                    'rule_explanation': 'Present simple for regular habits and routines',
                    'example_contrast': 'Correct: They play (habit). Incorrect: They are playing (now).',
                    'difficulty_level': 1,
                    'order': 3
                },
            ]
        else:
            tasks = self._get_generic_tasks(module, 3)

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _create_alphabet_tasks(self, module, language):
        """Create alphabet and pronunciation tasks"""
        if language == 'kazakh':
            tasks = [
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'How many letters are in the Kazakh alphabet?',
                        'options': ['33', '42', '26', '36']
                    },
                    'correct_answer': '42',
                    'rule_explanation': 'The Kazakh alphabet has 42 letters including special characters',
                    'example_contrast': 'Kazakh: 42 letters. Russian: 33 letters. English: 26 letters.',
                    'difficulty_level': 1,
                    'order': 1
                },
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'Which is a correct greeting in Kazakh?',
                        'options': ['Сәлеметсіз бе?', 'Здравствуйте', 'Hello', 'Bonjour']
                    },
                    'correct_answer': 'Сәлеметсіз бе?',
                    'rule_explanation': 'Сәлеметсіз бе? is the formal greeting in Kazakh',
                    'example_contrast': 'Formal: Сәлеметсіз бе? Informal: Сәлем!',
                    'difficulty_level': 1,
                    'order': 2
                },
            ]
        else:
            tasks = self._get_generic_tasks(module, 3)

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _create_basic_tasks(self, module, language):
        """Create basic introduction tasks"""
        tasks = [
            {
                'task_type': 'multiple_choice',
                'content': {
                    'question': 'What is your name? Choose the correct response:',
                    'options': ['My name is John', 'I am name John', 'Name my is John', 'John is name my']
                },
                'correct_answer': 'My name is John',
                'rule_explanation': 'The correct structure is: My name is [name]',
                'example_contrast': 'Correct: My name is John. Incorrect: I am name John.',
                'difficulty_level': 1,
                'order': 1
            },
            {
                'task_type': 'fill_blank',
                'content': {
                    'question': 'Nice to ___ you.',
                    'hint': 'Common greeting phrase'
                },
                'correct_answer': 'meet',
                'rule_explanation': '"Nice to meet you" is a standard greeting when meeting someone',
                'example_contrast': 'Correct: Nice to meet you. Common error: Nice to see you (first meeting).',
                'difficulty_level': 1,
                'order': 2
            },
        ]

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _create_daily_routine_tasks(self, module, language):
        """Create daily routine tasks"""
        if language == 'english':
            tasks = [
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'I ___ wake up at 7 AM on weekdays.',
                        'options': ['always', 'yesterday', 'tomorrow', 'now']
                    },
                    'correct_answer': 'always',
                    'rule_explanation': 'Frequency adverbs (always, usually, sometimes, never) go before main verbs',
                    'example_contrast': 'Correct: I always wake up. Incorrect: I wake up always.',
                    'difficulty_level': 1,
                    'order': 1
                },
                {
                    'task_type': 'fill_blank',
                    'content': {
                        'question': 'She ___ (have) breakfast at 8 o\'clock.',
                        'hint': 'Present simple'
                    },
                    'correct_answer': 'has',
                    'rule_explanation': 'Third person singular: have → has',
                    'example_contrast': 'Correct: She has breakfast. Incorrect: She have breakfast.',
                    'difficulty_level': 1,
                    'order': 2
                },
            ]
        else:
            tasks = self._get_generic_tasks(module, 3)

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _create_case_system_tasks(self, module, language):
        """Create Kazakh case system tasks"""
        if language == 'kazakh':
            tasks = [
                {
                    'task_type': 'multiple_choice',
                    'content': {
                        'question': 'Мен ___ барамын. (I am going to school)',
                        'options': ['мектеп', 'мектепке', 'мектепте', 'мектептен']
                    },
                    'correct_answer': 'мектепке',
                    'rule_explanation': 'Dative-locative case (-ке/-ға) is used for "to" (direction)',
                    'example_contrast': 'Correct: мектепке (to school). мектепте (at school). мектептен (from school).',
                    'difficulty_level': 2,
                    'order': 1
                },
                {
                    'task_type': 'fill_blank',
                    'content': {
                        'question': 'Ол үйде ___. (He is at home)',
                        'hint': 'verb: to sit/stay'
                    },
                    'correct_answer': 'отыр',
                    'rule_explanation': 'отыр is used for staying in a place',
                    'example_contrast': 'Correct: үйде отыр (at home). үйге барады (going home).',
                    'difficulty_level': 2,
                    'order': 2
                },
            ]
        else:
            tasks = self._get_generic_tasks(module, 3)

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _create_generic_tasks(self, module, language):
        """Create generic tasks for any module"""
        tasks = self._get_generic_tasks(module, 5)

        for task_data in tasks:
            TaskTemplate.objects.create(
                module=module,
                created_by_ai=False,
                **task_data
            )

    def _get_generic_tasks(self, module, count):
        """Get generic task templates"""
        tasks = []
        for i in range(count):
            tasks.append({
                'task_type': 'multiple_choice',
                'content': {
                    'question': f'Sample question {i+1} for {module.title}',
                    'options': ['Option A', 'Option B', 'Option C', 'Option D']
                },
                'correct_answer': 'Option A',
                'rule_explanation': f'This is a sample task for {module.title}',
                'example_contrast': 'Correct: Option A. Incorrect: Option B.',
                'difficulty_level': 1,
                'order': i + 1
            })
        return tasks
