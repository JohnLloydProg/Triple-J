from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils.timezone import now
from datetime import timedelta

# Create your models here.

class ValidationSession(models.Model):
    """
    Model responsible for the validating the user email and linking it to the registration page
    """

    validationCode = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    email = models.EmailField(max_length=255, verbose_name="Email")
    expirationDate = models.DateField(null=True, verbose_name='Expiration Date')

    def setExpirationDate(self):
        self.expirationDate = now().date() + timedelta(days=1)


class Membership(models.Model):
    """
    Model for the membership details. Also the parent model for daily and monthly memberships
    """

    membershipType = models.CharField(max_length=30)
    startDate = models.DateField(auto_now_add=True, editable=False)

    def json(self):
        return {
            'membershipType' : self.membershipType,
            'startDate' : self.startDate.isoformat()
        }


class DailyMembership(Membership):
    """
    Model for daily membership. Does not contain an expiration date
    """
    
    price = models.FloatField(default=50.00)

    def json(self):
        data = super().json()
        data['price'] = str(self.price)
        return data


class MonthlyMembership(Membership):
    """
    Model for montly membership. Contains expiration date for tracking.
    """

    expirationDate = models.DateField(default=now)
    price = models.FloatField(default=1000.00)

    def extendExpirationDate(self):
        self.expirationDate += timedelta(days=30)

    def json(self):
        data = super().json()
        data['dueDate'] = self.expirationDate.isoformat()
        data['price'] = str(self.price)
        return data


class Member(User):
    """
    Model used for member accounts. Also used for authentication. Inherits from the User class from django.
    """

    birthDate = models.DateField(null=True)
    height = models.FloatField(null=True)
    weight = models.FloatField(null=True)
    mobileNumber = models.CharField(max_length=10)
    address = models.CharField(max_length=200, null=True)
    membership = models.OneToOneField(Membership, on_delete=models.PROTECT)
    sex = models.CharField(max_length=30, default='NA')
    

    def json(self):
        return {
            'email' : self.email,
            'firstName' : self.first_name,
            'lastName' : self.last_name,
            'mobileNumber' : self.mobileNumber,
            'membership' : {self.membership.pk : self.membership.json()}
        }


class RefreshToken(models.Model):
    """
    Model used to store the refresh token of each account for token-based authentication.
    """

    token = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid1)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    expirationDate = models.DateField(null=True)

    def setExpirationDate(self):
        self.expirationDate = now().date() + timedelta(days=7)


class QRCode(models.Model):
    """
    Model used to store the QR code for logging purposes.
    """

    content = models.UUIDField(primary_key=True, default=uuid.uuid1)
    member = models.OneToOneField(Member, on_delete=models.CASCADE)
    expirationDate = models.DateField(null=True)

    def setExpirationDate(self):
        self.expirationDate = now().date() + timedelta(days=7)


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
