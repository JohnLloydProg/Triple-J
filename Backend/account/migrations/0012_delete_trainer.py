# Generated by Django 5.1.6 on 2025-03-07 09:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0011_remove_trainer_user_ptr_alter_member_gymtrainer_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Trainer',
        ),
    ]
