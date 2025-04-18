# Generated by Django 5.1.6 on 2025-02-23 07:52

import django.contrib.auth.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_member_is_trainer_member_trainer'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Trainer',
            fields=[
                ('user_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('is_trainer', models.BooleanField(default=True)),
                ('mobileNumber', models.CharField(max_length=15)),
                ('facebookAccount', models.URLField()),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.RemoveField(
            model_name='member',
            name='is_trainer',
        ),
        migrations.RemoveField(
            model_name='member',
            name='trainer',
        ),
        migrations.AlterField(
            model_name='member',
            name='mobileNumber',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AddField(
            model_name='member',
            name='gymTrainer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='account.trainer'),
        ),
    ]
