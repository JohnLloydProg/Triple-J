from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from .models import Member, RefreshToken
from datetime import date

#REMINDER: TEST AUTHENTICATION
class MemberAuthentication(BaseBackend):
    def authenticate(self, request, **kwargs):
        email = kwargs.get('email')
        password = kwargs.get('password')
        token = kwargs.get('token')
        if (token):
            try:
                refreshToken = RefreshToken.objects.get(token=token)
                if (date.today() > refreshToken.expirationDate):
                    refreshToken.delete()
                    return None
            except RefreshToken.DoesNotExist:
                return None
            return refreshToken.member
        
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return None
        return member if (member.check_password(password)) else None

    def get_user(self, user_id):
        try:
            return Member.objects.get(user=user_id)
        except Member.DoesNotExist:
            return None
