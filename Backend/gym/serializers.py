from rest_framework import serializers
from gym.models import Program, ProgramWorkout, Workout


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'day', 'member']
        extra_kwargs = {'member':{'read_only':True}}


class ProgramWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramWorkout
        fields = ['id', 'workout', 'details']
        depth = 1


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'type']
