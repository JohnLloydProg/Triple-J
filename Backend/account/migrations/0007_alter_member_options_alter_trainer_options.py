# Generated by Django 5.1.6 on 2025-02-23 09:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0006_alter_member_gymtrainer'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='member',
            options={'verbose_name': 'Member'},
        ),
        migrations.AlterModelOptions(
            name='trainer',
            options={'verbose_name': 'Trainer'},
        ),
    ]
