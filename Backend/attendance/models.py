from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils.timezone import now
from datetime import timedelta
from account.models import Member

# Create your models here.


class QRCode(models.Model):
    """
    Model used to store the QR code for logging purposes.
    """

    content = models.UUIDField(primary_key=True, default=uuid.uuid1, editable=False)
    member = models.OneToOneField(Member, on_delete=models.CASCADE)
    expirationDate = models.DateField(null=True)

    def setExpirationDate(self):
        self.expirationDate = now().date() + timedelta(days=7)
    
    def isExpired(self):
        return now().date() > self.expirationDate


class Attendance(models.Model):
    """
    Model used to store the date, time-in, and time-out for attendance. It is also the way for tracking the number of members in the gym.
    """

    date = models.DateField(default=now)
    timeIn = models.TimeField(default=now)
    timeOut = models.TimeField(null=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)

    def logOut(self):
        self.timeOut = now().time()
