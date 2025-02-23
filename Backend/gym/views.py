from django.http import HttpRequest, JsonResponse
from django.shortcuts import render, redirect
from account.models import Member
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from gym.serializers import ProgramSerializer, WorkoutSerializer
from django.utils.timezone import now
from django.views import View
from datetime import date
from gym.models import Program, Workout
import json

# Create your views here.


class ProgramCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.request.user)
        return Program.objects.filter(member=member)

    def perform_create(self, serializer):
        member = Member.objects.get(pk=self.request.user)
        if serializer.is_valid():
            serializer.save(member=member)
        else:
            print(serializer.errors)


class ProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        programs = Program.objects.filter(member=member)
        data = []
        for program in programs:
            programData = ProgramSerializer(program).data
            workouts = Workout.objects.filter(program=program)
            programData['workouts'] = [{'name':workout.name, 'type':workout.type} for workout in workouts]
            data.append(programData)
        return Response(data)


class CurrentProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        
        try:
            program = Program.objects.get(member=member, day=now().weekday())
            workouts = Workout.objects.filter(program=program)
            data = {'day':program.day, 'workouts':WorkoutSerializer(workouts, many=True).data}
            return Response(data)            
        except Program.DoesNotExist:
            return JsonResponse({})


class ProgramUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.request.user)
        return Program.objects.filter(member=member)
        

class ProgramDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        member = Member.objects.get(pk=self.request.user)
        return Program.objects.filter(member=member)


class WorkoutCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkoutSerializer

    def get_queryset(self):
        return Workout.objects.filter(program=self.kwargs['program'])

    def perform_create(self, serializer):
        program = Program.objects.get(pk=self.kwargs['program'])
        if serializer.is_valid():
            serializer.save(program=program)
        else:
            print(serializer.errors)


class WorkUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkoutSerializer

    def get_queryset(self):
        return Workout.objects.filter(program=self.kwargs['program'])
    

class WorkDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkoutSerializer

    def get_queryset(self):
        return Workout.objects.filter(program=self.kwargs['program'])