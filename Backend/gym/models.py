from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils.timezone import now
from datetime import timedelta
from account.models import Member

# Create your models here.

def timelineRecordPath(instance, filename):
    return f'user_{str(instance.user.id)}/timeline/{filename}'


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
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=5, choices={
        "L":"Lower",
        "U":"Upper",
        "C":"Core",
        "PS":"Push",
        "PL":"Pull"
        }
    )


class ProgramWorkout(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    details = models.JSONField()


class ProgramWorkoutRecord(models.Model):
    date = models.DateField(default=now)
    programWorkout = models.ForeignKey(ProgramWorkout, on_delete=models.CASCADE)
    details = models.JSONField()


class TimelineRecord(models.Model):
    date = models.DateField(default=now)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    img = models.ImageField(upload_to=timelineRecordPath, null=True, blank=True)