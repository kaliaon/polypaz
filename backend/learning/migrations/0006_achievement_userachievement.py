from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('learning', '0005_gamificationprofile_progresssnapshot'),
    ]

    operations = [
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.SlugField(help_text="Stable identifier, e.g. 'xp_500' or 'streak_7'", max_length=64, unique=True)),
                ('title', models.CharField(max_length=80)),
                ('description', models.CharField(max_length=200)),
                ('icon', models.CharField(default='🏅', help_text='Emoji shown on the badge', max_length=8)),
                ('category', models.CharField(choices=[('xp', 'Total XP'), ('streak', 'Streak')], max_length=16)),
                ('threshold', models.IntegerField(help_text='Value required (XP for category=xp, days for category=streak)')),
                ('sort_order', models.IntegerField(default=0)),
            ],
            options={
                'verbose_name': 'Achievement',
                'verbose_name_plural': 'Achievements',
                'ordering': ['sort_order', 'category', 'threshold'],
            },
        ),
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unlocks', to='learning.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Achievement',
                'verbose_name_plural': 'User Achievements',
                'ordering': ['-earned_at'],
                'unique_together': {('user', 'achievement')},
            },
        ),
    ]
