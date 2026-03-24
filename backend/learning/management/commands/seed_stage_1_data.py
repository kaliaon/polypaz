import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from learning.models import (
    PlacementTest, PlacementTestItem, Roadmap, Module,
    TaskTemplate, DialogueScenario,
)

FIXTURE_DIR = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'seed_data'


def load_json(filename):
    with open(FIXTURE_DIR / filename) as f:
        return json.load(f)


class Command(BaseCommand):
    help = 'Seeds the database with Stage 1 data from JSON fixtures'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush', action='store_true',
            help='Delete existing seed data before re-seeding',
        )

    def handle(self, *args, **options):
        if options['flush']:
            self._flush()

        self.seed_placement_tests()
        self.seed_roadmaps_and_tasks()
        self.seed_dialogues()

        self.stdout.write(self.style.SUCCESS('Successfully seeded all Stage 1 data!'))

    # ------------------------------------------------------------------ flush
    def _flush(self):
        self.stdout.write(self.style.WARNING('Flushing existing seed data...'))
        user = User.objects.filter(username='template_bot').first()
        if user:
            Roadmap.objects.filter(user=user).delete()
        PlacementTest.objects.all().delete()
        DialogueScenario.objects.all().delete()

    # -------------------------------------------------------- placement tests
    def seed_placement_tests(self):
        data = load_json('placement_tests.json')

        for language, test_data in data.items():
            test, created = PlacementTest.objects.get_or_create(
                language=language,
                defaults={
                    'total_items': test_data['total_items'],
                    'is_active': True,
                },
            )
            if not created:
                self.stdout.write(f'  Placement test for {language} already exists, skipping')
                continue

            for idx, item in enumerate(test_data['items'], start=1):
                PlacementTestItem.objects.create(
                    test=test,
                    item_type=item['item_type'],
                    question_text=item['question_text'],
                    correct_answer=item['correct_answer'],
                    options=item.get('options'),
                    difficulty_weight=item['difficulty_weight'],
                    order=idx,
                )

            self.stdout.write(f'  Created {language} placement test ({len(test_data["items"])} items)')

    # ------------------------------------------------- roadmaps, modules, tasks
    def seed_roadmaps_and_tasks(self):
        roadmap_data = load_json('roadmaps.json')
        task_data = load_json('tasks.json')

        tu = roadmap_data['template_user']
        template_user, _ = User.objects.get_or_create(
            username=tu['username'],
            defaults={'email': tu['email']},
        )

        for rm in roadmap_data['roadmaps']:
            roadmap, created = Roadmap.objects.get_or_create(
                user=template_user,
                language=rm['language'],
                cefr_level=rm['cefr_level'],
                defaults={
                    'generated_by_ai': rm['generated_by_ai'],
                    'is_active': rm['is_active'],
                    'roadmap_data': {},
                },
            )
            if not created:
                self.stdout.write(f'  Roadmap {rm["language"]}/{rm["cefr_level"]} already exists, skipping')
                continue

            for mod_data in rm['modules']:
                module = Module.objects.create(
                    roadmap=roadmap,
                    title=mod_data['title'],
                    description=mod_data['description'],
                    objectives=mod_data['objectives'],
                    order=mod_data['order'],
                )

                task_key = f'{rm["language"]}/{mod_data["order"]}'
                tasks = task_data.get(task_key, [])

                for idx, t in enumerate(tasks, start=1):
                    TaskTemplate.objects.create(
                        module=module,
                        task_type=t['task_type'],
                        content=t['content'],
                        correct_answer=t['correct_answer'],
                        rule_explanation=t.get('rule_explanation', ''),
                        example_contrast=t.get('example_contrast', ''),
                        difficulty_level=t.get('difficulty_level', 1),
                        created_by_ai=False,
                        order=idx,
                    )

                self.stdout.write(f'    Module "{module.title}" + {len(tasks)} tasks')
            self.stdout.write(f'  Created roadmap: {rm["language"]}/{rm["cefr_level"]}')

    # ------------------------------------------------------------ dialogues
    def seed_dialogues(self):
        data = load_json('dialogues.json')

        count = 0
        for language in data['languages']:
            for sc in data['scenarios']:
                _, created = DialogueScenario.objects.get_or_create(
                    title=sc['title'],
                    language=language,
                    defaults={
                        'cefr_level': sc['cefr_level'],
                        'context_description': sc['context_description'],
                        'max_turns': sc.get('max_turns', 10),
                        'is_active': True,
                    },
                )
                if created:
                    count += 1

        self.stdout.write(f'  Created {count} dialogue scenarios')
