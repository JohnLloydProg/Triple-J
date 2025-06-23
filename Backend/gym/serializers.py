from rest_framework import serializers
from gym.models import Program, ProgramWorkout, Workout, ProgramWorkoutRecord, TimelineRecord
from account.serializers import TrainerProfileSerializer

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'day', 'member']
        extra_kwargs = {'member':{'read_only':True}}


class ProgramWorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramWorkout
        fields = ['id', 'workout', 'details']


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'type', 'time', 'sets', 'reps', 'weight', 'distance']


class ProgramWorkoutRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramWorkoutRecord
        fields = ['id', 'date', 'details']
        extra_kwargs = {'date':{'read_only':True}}


class TimelineRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineRecord
        fields = ['id', 'date', 'height', 'weight', 'img']

class ProgramSerializer(serializers.ModelSerializer):
    # This line tells Django to use your detailed TrainerProfileSerializer
    # when serializing the 'coach' object.
    coach = TrainerProfileSerializer(read_only=True)
    
    # You might have other fields here, like a nested workout serializer
    workouts = YourWorkoutSummarySerializer(many=True, read_only=True) # Example

    class Meta:
        model = Program
        # Ensure 'coach' is in the fields list.
        fields = ['id', 'day', 'workouts', 'coach']