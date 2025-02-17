from rest_framework import serializers
from gym.models import Program, Workout


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'day', 'member']
        extra_kwargs = {'member':{'read_only':True}}


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'program', 'type', 'details']
        extra_kwargs = {'program':{'read_only':True}}
