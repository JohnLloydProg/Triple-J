from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsTrainer
from scheduling.serializers import ScheduleSerializer
from scheduling.models import Schedule
from account.models import Member
from django.utils.timezone import now
from django.http.response import JsonResponse

# Create your views here.


class SchedulesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    
    def get(self, request):
        schedules = []
        trainer = Member.objects.get(pk=self.request.user)
        for schedule in Schedule.objects.all():
            if (schedule.trainee.gymTrainer == trainer):
                schedules.append(ScheduleSerializer(schedule).data)
        return Response(schedules)


class NextScheduleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = Member.objects.get(pk=self.request.user)
        schedules = Schedule.objects.filter(trainee=member).order_by('day')
        for schedule in schedules: 
            if (schedule.day >= now().weekday()):
                return Response(ScheduleSerializer(schedule).data)
        return JsonResponse({})


class ScheduleCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()


class ScheduleUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()

