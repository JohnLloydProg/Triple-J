from django.db import models
from django.contrib.auth.models import AbstractBaseUser
import uuid
from datetime import date, timedelta

# Create your models here.

class ValidationSession(models.Model):
    validationCode = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    email = models.EmailField()
    dueDate = models.DateField(default=date.today() + timedelta(days=1))


class Membership(models.Model):
    membershipType = models.CharField(max_length=30)
    startDate = models.DateField(auto_now_add=True, editable=False)

    def json(self):
        return {
            'membershipType' : self.membershipType,
            'startDate' : self.startDate.isoformat()
        }


class DailyMembership(Membership):
    price = models.FloatField(default=50.00)

    def json(self):
        data = super().json()
        data['price'] = str(self.price)
        return data


class MonthlyMembership(Membership):
    dueDate = models.DateField(default=date.today() + timedelta(days=30))
    price = models.FloatField(default=1000.00)

    def json(self):
        data = super().json()
        data['dueDate'] = self.dueDate.isoformat()
        data['price'] = str(self.price)
        return data


class Member(AbstractBaseUser):
    USERNAME_FIELD = 'email'

    email = models.EmailField(unique=True, blank=False)
    password = models.CharField(max_length=30)
    firstName = models.CharField(max_length=30)
    lastName = models.CharField(max_length=30)
    mobileNumber = models.CharField(max_length=10)
    membership = models.OneToOneField(Membership, on_delete=models.CASCADE)
    

    def json(self):
        return {
            'email' : self.email,
            'password' : self.password,
            'firstName' : self.firstName,
            'lastName' : self.lastName,
            'mobileNumber' : self.mobileNumber,
            'membership' : self.membership.json()
        }


class RefreshToken(models.Model):
    token = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid1)
    member = models.OneToOneField(Member, on_delete=models.CASCADE)
    expirationDate = models.DateField(default=date.today() + timedelta(days=7))
