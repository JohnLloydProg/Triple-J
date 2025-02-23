from rest_framework import permissions
from account.models import Trainer


class IsTrainer(permissions.BasePermission):

    def has_permission(self, request, view):
        try:
            trainer = Trainer.objects.get(pk=request.user)
            return True
        except Trainer.DoesNotExist:
            return False

