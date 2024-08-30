# Generated by Django 5.0.2 on 2024-05-28 16:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivitySummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activity_summary', to='account.profile')),
            ],
            options={
                'verbose_name': 'Activity Summary',
                'verbose_name_plural': 'Activity Summaries',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='BodyFatLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fat_logs', to='account.profile')),
            ],
            options={
                'verbose_name': 'Body Fat Log',
                'verbose_name_plural': 'Body Fat Logs',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='BodyWeightLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='weight_logs', to='account.profile')),
            ],
            options={
                'verbose_name': 'Body Weight Log',
                'verbose_name_plural': 'Body Weight Logs',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='FoodSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='food_summary', to='account.profile')),
            ],
            options={
                'verbose_name': 'Food Summary',
                'verbose_name_plural': 'Food Summaries',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='HeartRateSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='heart_rate_summary', to='account.profile')),
            ],
            options={
                'verbose_name': 'Heart Rate Timeseries',
                'verbose_name_plural': 'Heart Rate Timeseries',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='SleepSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sleep_summary', to='account.profile')),
            ],
            options={
                'verbose_name': 'Sleep Summary',
                'verbose_name_plural': 'Sleep Summaries',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='WaterSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=None)),
                ('data', models.JSONField(default=dict)),
                ('fb_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='water_summary', to='account.profile')),
            ],
            options={
                'verbose_name': 'Water Summary',
                'verbose_name_plural': 'Water Summaries',
                'ordering': ['date'],
            },
        ),
    ]
