# Generated by Django 5.1.7 on 2025-06-04 00:34

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scheduling', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='schedule',
            name='day',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='time',
        ),
        migrations.AddField(
            model_name='schedule',
            name='datetime',
            field=models.DateTimeField(default=datetime.datetime(2025, 6, 4, 0, 34, 14, 624227)),
            preserve_default=False,
        ),
    ]
