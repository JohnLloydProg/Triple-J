from django.db import models
from account.models import Member

# Create your models here.


class Schedule(models.Model):
    trainee = models.ForeignKey(Member, on_delete=models.CASCADE)
    day = models.IntegerField(choices={
        0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday',
        4:'Friday', 5:'Saturday', 6:'Sunday'
    })
    time = models.TimeField()

