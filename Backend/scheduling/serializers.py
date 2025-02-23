from rest_framework import serializers
from scheduling.models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['gymTrainer', 'trainee', 'day', 'time']
