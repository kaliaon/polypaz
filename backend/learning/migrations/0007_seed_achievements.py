from django.db import migrations


ACHIEVEMENTS = [
    # Streak milestones
    {'code': 'streak_3',  'title': 'Fire Starter',   'description': 'Reach a 3-day streak',  'icon': '🔥', 'category': 'streak', 'threshold': 3,    'sort_order': 10},
    {'code': 'streak_7',  'title': 'On a Roll',      'description': 'Reach a 7-day streak',  'icon': '🚀', 'category': 'streak', 'threshold': 7,    'sort_order': 20},
    {'code': 'streak_14', 'title': 'Two Weeks Strong', 'description': 'Reach a 14-day streak', 'icon': '💪', 'category': 'streak', 'threshold': 14,  'sort_order': 30},
    {'code': 'streak_30', 'title': 'Unstoppable',    'description': 'Reach a 30-day streak', 'icon': '⚡', 'category': 'streak', 'threshold': 30,   'sort_order': 40},

    # XP milestones
    {'code': 'xp_100',    'title': 'First Steps',     'description': 'Earn 100 XP',    'icon': '🌱', 'category': 'xp', 'threshold': 100,    'sort_order': 110},
    {'code': 'xp_500',    'title': 'Novice Scholar',  'description': 'Earn 500 XP',    'icon': '📘', 'category': 'xp', 'threshold': 500,    'sort_order': 120},
    {'code': 'xp_1000',   'title': 'Word Warrior',    'description': 'Earn 1,000 XP',  'icon': '⚔️',  'category': 'xp', 'threshold': 1000,   'sort_order': 130},
    {'code': 'xp_5000',   'title': 'Polyglot',        'description': 'Earn 5,000 XP',  'icon': '🎓', 'category': 'xp', 'threshold': 5000,   'sort_order': 140},
    {'code': 'xp_10000',  'title': 'Language Legend', 'description': 'Earn 10,000 XP', 'icon': '👑', 'category': 'xp', 'threshold': 10000,  'sort_order': 150},
]


def seed_achievements(apps, schema_editor):
    Achievement = apps.get_model('learning', 'Achievement')
    for data in ACHIEVEMENTS:
        Achievement.objects.update_or_create(code=data['code'], defaults=data)


def unseed_achievements(apps, schema_editor):
    Achievement = apps.get_model('learning', 'Achievement')
    Achievement.objects.filter(code__in=[a['code'] for a in ACHIEVEMENTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('learning', '0006_achievement_userachievement'),
    ]

    operations = [
        migrations.RunPython(seed_achievements, unseed_achievements),
    ]
