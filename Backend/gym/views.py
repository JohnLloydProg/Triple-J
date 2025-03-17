from django.http import HttpRequest, JsonResponse
from django.shortcuts import render, redirect
from account.models import Member
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from gym.serializers import ProgramSerializer, ProgramWorkoutSerializer, WorkoutSerializer, ProgramWorkoutRecordSerializer, TimelineRecordSerializer
from django.utils.timezone import now
from django.views import View
from datetime import date
from gym.models import Program, ProgramWorkout, Workout, ProgramWorkoutRecord, TimelineRecord
from django.core.files import File
import json
import base64

# Create your views here.


class ProgramCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.kwargs.get('user'))
        return Program.objects.filter(member=member)

    def perform_create(self, serializer):
        member = Member.objects.get(pk=self.kwargs.get('user'))
        if serializer.is_valid():
            serializer.save(member=member)
        else:
            print(serializer.errors)


class ProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user):
        member = Member.objects.get(pk=user)
        programs = Program.objects.filter(member=member)
        data = []
        for program in programs:
            programData = ProgramSerializer(program).data
            programWorkouts = ProgramWorkout.objects.filter(program=program)
            programData['workouts'] = [{'name':programWorkout.workout.name, 'type':programWorkout.workout.type} for programWorkout in programWorkouts]
            data.append(programData)
        return Response(data)


class CurrentProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        
        try:
            program = Program.objects.get(member=member, day=now().weekday())
            programWorkouts = ProgramWorkout.objects.filter(program=program)
            data = {'day':program.day, 'workouts':ProgramWorkoutSerializer(programWorkouts, many=True).data}
            return Response(data)            
        except Program.DoesNotExist:
            return JsonResponse({})


class ProgramUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.kwargs.get('user'))
        return Program.objects.filter(member=member)
        

class ProgramDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.kwargs.get('user'))
        return Program.objects.filter(member=member)


class ProgramWorkoutCreateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramWorkoutSerializer
    
    def get(self, request, program):
        programWorkouts = ProgramWorkoutSerializer(ProgramWorkout.objects.filter(program=program), many=True).data
        for programWorkout in programWorkouts:
            programWorkout['workout'] = WorkoutSerializer(Workout.objects.get(pk=programWorkout['workout'])).data
        return Response(programWorkouts)

    def post(self, request, program):
        program = Program.objects.get(pk=program)
        workout = Workout.objects.get(pk=request.data.get('workout'))
        programWorkout = ProgramWorkout(workout=workout, program=program, details=request.data.get('details'))
        programWorkout.save()
        return Response(ProgramWorkoutSerializer(programWorkout).data)


class ProgramWorkoutUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramWorkoutSerializer

    def get_queryset(self):
        return ProgramWorkout.objects.filter(program=self.kwargs['program'])
    

class ProgramWorkoutDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramWorkoutSerializer

    def get_queryset(self):
        return ProgramWorkout.objects.filter(program=self.kwargs['program'])


class WorkoutsView(generics.ListAPIView):
    permission_classes = []
    serializer_class = WorkoutSerializer
    queryset = Workout.objects.all()


class ProgramWorkoutRecordsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, programWorkout):
        programWorkout = ProgramWorkout.objects.get(pk=programWorkout)
        records = ProgramWorkoutRecord.objects.filter(programWorkout=programWorkout).order_by('-date')
        return Response(ProgramWorkoutRecordSerializer(records, many=True).data)

    def post(self, request, programWorkout):
        programWorkout = ProgramWorkout.objects.get(pk=programWorkout)
        records = ProgramWorkoutRecord.objects.filter(programWorkout=programWorkout)
        if (len(records) == 10):
            records.first().delete()
        details = request.data.get('details')
        if (not details):
            return JsonResponse({'details':'Does not contain details'}, status=400)
        record = ProgramWorkoutRecord(programWorkout=programWorkout, details=details)
        record.save()
        return JsonResponse({'id':record.pk, 'date':record.date, 'details':record.details})


class TimelineRecordsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        records = TimelineRecord.objects.filter(member=member).order_by('-date')
        return Response(TimelineRecordSerializer(records, many=True).data)

    def post(self, request):
        member = Member.objects.get(pk=self.request.user)
        if (not request.data):
            print(request.data)
            return JsonResponse({'details':'Does not contain information'}, status=400)
        record = TimelineRecord(member=member, height=request.data.get('height'), weight=request.data.get('weight'))
        record.img.save('image.jpg', File(base64.b64decode(request.data.get('img'))))
        record.save()
        response = {'id':record.pk, 'date':record.date, 'height':record.height, 'weight':record.weight}
        if (record.img):
            response['img'] = record.img
        return Response(response)


class CurrentTimelineRecordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        records = TimelineRecord.objects.filter(member=member).order_by('-date')
        return Response(TimelineRecordSerializer(records.first()).data)

