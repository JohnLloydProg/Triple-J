from rest_framework import serializers
from gym.models import Program, ProgramWorkout


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'day', 'member']
        extra_kwargs = {'member':{'read_only':True}}


class ProgramWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramWorkout
        fields = ['id', 'workout', 'details']
        extra_kwargs = {'program':{'read_only':True}}
        depth = 1
