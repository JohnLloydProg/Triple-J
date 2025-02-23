from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils.timezone import now
from datetime import timedelta
from account.models import Member

# Create your models here.


class Program(models.Model):
    day = models.IntegerField(
        choices={
            0 : "Monday", 1:"Tuesday", 2:"Wednesday", 3:"Thursday", 
            4:"Friday", 5:'Saturday', 6:'Sunday'
            },
        null=True
    )
    member = models.ForeignKey(Member, on_delete=models.CASCADE)


class Workout(models.Model):
    name = models.CharField(max_length=25)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    type = models.CharField(max_length=5, choices={
        "L":"Lower",
        "U":"Upper",
        "C":"Core",
        "PS":"Push",
        "PL":"Pull"
        }
    )
    details = models.JSONField()
