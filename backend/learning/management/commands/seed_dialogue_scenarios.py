from django.core.management.base import BaseCommand
from learning.models import DialogueScenario


class Command(BaseCommand):
    help = 'Seed dialogue scenarios for conversational practice'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding dialogue scenarios...')

        # Delete existing scenarios
        DialogueScenario.objects.all().delete()

        # Create scenarios for different languages and levels
        self._create_english_scenarios()
        self._create_kazakh_scenarios()

        self.stdout.write(self.style.SUCCESS('Successfully seeded dialogue scenarios!'))

    def _create_english_scenarios(self):
        """Create English dialogue scenarios"""
        scenarios = [
            {
                'title': 'At a Café',
                'language': 'english',
                'cefr_level': 'A1',
                'context_description': 'You are at a café and want to order a coffee and a sandwich. Practice ordering food and drinks politely.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Meeting a Friend',
                'language': 'english',
                'cefr_level': 'A1',
                'context_description': 'You are meeting a friend you haven\'t seen in a while. Practice greeting, asking how they are, and making small talk.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Shopping for Clothes',
                'language': 'english',
                'cefr_level': 'A2',
                'context_description': 'You are in a clothing store looking for a new shirt. Practice asking for sizes, colors, and prices.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Job Interview',
                'language': 'english',
                'cefr_level': 'B1',
                'context_description': 'You are in a job interview. Practice answering questions about your experience, skills, and career goals.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Asking for Directions',
                'language': 'english',
                'cefr_level': 'A1',
                'context_description': 'You are lost and need to find the train station. Practice asking for and understanding directions.',
                'max_turns': 10,
                'is_active': True
            },
        ]

        for scenario_data in scenarios:
            DialogueScenario.objects.create(**scenario_data)

        self.stdout.write(f'  Created {len(scenarios)} English scenarios')

    def _create_kazakh_scenarios(self):
        """Create Kazakh dialogue scenarios"""
        scenarios = [
            {
                'title': 'Кафеде (At a Café)',
                'language': 'kazakh',
                'cefr_level': 'A1',
                'context_description': 'Сіз кафеде отырсыз және тамақ тапсырғыңыз келеді. Practice ordering food and drinks in Kazakh.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Досымен кездесу (Meeting a Friend)',
                'language': 'kazakh',
                'cefr_level': 'A1',
                'context_description': 'Сіз досыңызбен кездесіп жатырсыз. Practice greeting and simple conversation in Kazakh.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Дүкенде (Shopping)',
                'language': 'kazakh',
                'cefr_level': 'A2',
                'context_description': 'Сіз дүкенде сатып алуға келдіңіз. Practice asking about products, prices, and making purchases.',
                'max_turns': 10,
                'is_active': True
            },
            {
                'title': 'Жол сұрау (Asking for Directions)',
                'language': 'kazakh',
                'cefr_level': 'A1',
                'context_description': 'Сіз жолды жоғалттыңыз және көмек керек. Practice asking for directions in Kazakh.',
                'max_turns': 10,
                'is_active': True
            },
        ]

        for scenario_data in scenarios:
            DialogueScenario.objects.create(**scenario_data)

        self.stdout.write(f'  Created {len(scenarios)} Kazakh scenarios')
