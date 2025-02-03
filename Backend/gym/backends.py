from django.contrib.auth.backends import BaseBackend
from .models import Member, RefreshToken


class MemberAuthentication(BaseBackend):
    def authenticate(self, request, **kwargs):
        email = kwargs.get('email')
        password = kwargs.get('password')
        token = kwargs.get('token')
        if (token):
            try:
                refreshToken = RefreshToken.objects.get(token=token)
            except RefreshToken.DoesNotExist:
                return None
            return refreshToken.member
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return None
        return member if (member.password == password) else None

    def get_user(self, user_id):
        try:
            return Member.objects.get(pk=user_id)
        except Member.DoesNotExist:
            return None
