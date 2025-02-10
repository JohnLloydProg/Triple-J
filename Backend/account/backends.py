from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from django.contrib.auth import login
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
            if (member.check_password(password)):
                login(request, member, 'account.backends.MemberAuthentication')
                return member
        except Member.DoesNotExist:
            return None
        return None

    def get_user(self, user_id):
        try:
            return Member.objects.get(pk=user_id)
        except Member.DoesNotExist:
            return None
