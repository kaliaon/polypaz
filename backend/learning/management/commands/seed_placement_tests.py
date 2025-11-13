from django.core.management.base import BaseCommand
from learning.models import PlacementTest, PlacementTestItem


class Command(BaseCommand):
    help = 'Seed placement test data for all languages'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding placement tests...')

        # English Placement Test
        self._create_english_test()

        # Kazakh Placement Test
        self._create_kazakh_test()

        self.stdout.write(self.style.SUCCESS('Successfully seeded placement tests!'))

    def _create_english_test(self):
        """Create English placement test with sample questions"""
        # Delete existing active English test
        PlacementTest.objects.filter(language='english', is_active=True).delete()

        test = PlacementTest.objects.create(
            language='english',
            total_items=12,
            is_active=True
        )

        # Sample questions for English test
        questions = [
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'What is your name?', 'question': 'Choose the correct response:'},
                'correct_answer': 'my name is john',
                'options': ['my name is john', 'i am name john', 'name my is john', 'john is name my'],
                'difficulty_weight': 0.5,
                'order': 1
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'She ___ to school every day.', 'question': 'Fill in the blank:'},
                'correct_answer': 'goes',
                'options': ['go', 'goes', 'going', 'gone'],
                'difficulty_weight': 0.8,
                'order': 2
            },
            {
                'item_type': 'cloze',
                'question_text': {'en': 'I ___ studying English for two years.', 'hint': 'present perfect continuous'},
                'correct_answer': 'have been',
                'options': None,
                'difficulty_weight': 1.0,
                'order': 3
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'If I ___ rich, I would travel the world.', 'question': 'Choose the correct form:'},
                'correct_answer': 'were',
                'options': ['am', 'was', 'were', 'be'],
                'difficulty_weight': 1.2,
                'order': 4
            },
            {
                'item_type': 'translation',
                'question_text': {'en': 'Translate to English: "Привет, как дела?"'},
                'correct_answer': 'hello, how are you',
                'options': None,
                'difficulty_weight': 1.0,
                'order': 5
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'The book ___ by millions of people.', 'question': 'Choose passive voice:'},
                'correct_answer': 'was read',
                'options': ['read', 'was read', 'is reading', 'reads'],
                'difficulty_weight': 1.3,
                'order': 6
            },
            {
                'item_type': 'cloze',
                'question_text': {'en': 'She is good ___ playing piano.', 'hint': 'preposition'},
                'correct_answer': 'at',
                'options': None,
                'difficulty_weight': 0.8,
                'order': 7
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'Which sentence is grammatically correct?'},
                'correct_answer': 'i have never been to paris',
                'options': ['i have never been to paris', 'i never have been to paris', 'i have been never to paris', 'never i have been to paris'],
                'difficulty_weight': 1.1,
                'order': 8
            },
            {
                'item_type': 'cloze',
                'question_text': {'en': 'Despite ___ tired, she continued working.', 'hint': 'gerund form'},
                'correct_answer': 'being',
                'options': None,
                'difficulty_weight': 1.4,
                'order': 9
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'en': 'I wish I ___ speak Spanish fluently.', 'question': 'Choose the correct form:'},
                'correct_answer': 'could',
                'options': ['can', 'could', 'will', 'would'],
                'difficulty_weight': 1.3,
                'order': 10
            },
            {
                'item_type': 'translation',
                'question_text': {'en': 'Translate: "Where is the library?"'},
                'correct_answer': 'where is the library',
                'options': None,
                'difficulty_weight': 0.6,
                'order': 11
            },
            {
                'item_type': 'cloze',
                'question_text': {'en': 'The project ___ completed by next week.', 'hint': 'future passive'},
                'correct_answer': 'will be',
                'options': None,
                'difficulty_weight': 1.5,
                'order': 12
            },
        ]

        for q in questions:
            PlacementTestItem.objects.create(
                test=test,
                item_type=q['item_type'],
                question_text=q['question_text'],
                correct_answer=q['correct_answer'],
                options=q['options'],
                difficulty_weight=q['difficulty_weight'],
                order=q['order']
            )

        self.stdout.write(f'  Created English test with {len(questions)} questions')

    def _create_kazakh_test(self):
        """Create Kazakh placement test with sample questions"""
        # Delete existing active Kazakh test
        PlacementTest.objects.filter(language='kazakh', is_active=True).delete()

        test = PlacementTest.objects.create(
            language='kazakh',
            total_items=12,
            is_active=True
        )

        # Sample questions for Kazakh test
        questions = [
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Сәлеметсіз бе?', 'question': 'Choose the correct response:'},
                'correct_answer': 'сәлеметсіз бе',
                'options': ['сәлеметсіз бе', 'сәлем', 'қош келдіңіз', 'рахмет'],
                'difficulty_weight': 0.5,
                'order': 1
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Мен ___ барамын.', 'question': 'Fill in the blank (to school):'},
                'correct_answer': 'мектепке',
                'options': ['мектеп', 'мектепке', 'мектепте', 'мектептен'],
                'difficulty_weight': 0.8,
                'order': 2
            },
            {
                'item_type': 'cloze',
                'question_text': {'kk': 'Бұл менің ___', 'hint': 'my book'},
                'correct_answer': 'кітабым',
                'options': None,
                'difficulty_weight': 0.7,
                'order': 3
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Choose the correct plural form of "бала" (child):'},
                'correct_answer': 'балалар',
                'options': ['балалар', 'балалер', 'балақар', 'балатар'],
                'difficulty_weight': 0.9,
                'order': 4
            },
            {
                'item_type': 'translation',
                'question_text': {'en': 'Translate to Kazakh: "Hello, how are you?"'},
                'correct_answer': 'сәлеметсіз бе, қалыңыз қалай',
                'options': None,
                'difficulty_weight': 1.0,
                'order': 5
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Мен кітап ___', 'question': 'Choose correct form (I am reading):'},
                'correct_answer': 'оқып жатырмын',
                'options': ['оқимын', 'оқып жатырмын', 'оқыдым', 'оқығым келеді'],
                'difficulty_weight': 1.1,
                'order': 6
            },
            {
                'item_type': 'cloze',
                'question_text': {'kk': 'Ол үйде ___', 'hint': 'at home'},
                'correct_answer': 'отыр',
                'options': None,
                'difficulty_weight': 1.0,
                'order': 7
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Which is the correct possessive form? (his book)'},
                'correct_answer': 'оның кітабы',
                'options': ['оның кітабы', 'оның кітабым', 'оның кітабың', 'оның кітаптар'],
                'difficulty_weight': 1.2,
                'order': 8
            },
            {
                'item_type': 'cloze',
                'question_text': {'kk': 'Біз ертең Астанаға ___', 'hint': 'we will go'},
                'correct_answer': 'барамыз',
                'options': None,
                'difficulty_weight': 1.3,
                'order': 9
            },
            {
                'item_type': 'multiple_choice',
                'question_text': {'kk': 'Choose the correct past tense form: (I went)'},
                'correct_answer': 'мен бардым',
                'options': ['мен барамын', 'мен бардым', 'мен барғам келеді', 'мен бара жатырмын'],
                'difficulty_weight': 1.2,
                'order': 10
            },
            {
                'item_type': 'translation',
                'question_text': {'en': 'Translate: "Thank you very much"'},
                'correct_answer': 'рахмет сізге',
                'options': None,
                'difficulty_weight': 0.8,
                'order': 11
            },
            {
                'item_type': 'cloze',
                'question_text': {'kk': 'Сен қайда ___?', 'hint': 'where are you going?'},
                'correct_answer': 'барасың',
                'options': None,
                'difficulty_weight': 1.4,
                'order': 12
            },
        ]

        for q in questions:
            PlacementTestItem.objects.create(
                test=test,
                item_type=q['item_type'],
                question_text=q['question_text'],
                correct_answer=q['correct_answer'],
                options=q['options'],
                difficulty_weight=q['difficulty_weight'],
                order=q['order']
            )

        self.stdout.write(f'  Created Kazakh test with {len(questions)} questions')
