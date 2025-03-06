# Generated by Django 5.1.6 on 2025-03-06 06:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('account', '0008_alter_member_gymtrainer'),
    ]

    operations = [
        migrations.CreateModel(
            name='Workout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(choices=[('L', 'Lower'), ('U', 'Upper'), ('C', 'Core'), ('PS', 'Push'), ('PL', 'Pull')], max_length=5)),
            ],
        ),
        migrations.CreateModel(
            name='Program',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.IntegerField(choices=[(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')], null=True)),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='account.member')),
            ],
        ),
        migrations.CreateModel(
            name='ProgramWorkout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('details', models.JSONField()),
                ('program', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gym.program')),
                ('workout', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gym.workout')),
            ],
        ),
    ]
