from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsTrainer
from scheduling.serializers import ScheduleSerializer
from scheduling.models import Schedule

# Create your views here.


class ScheduleView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
    
    def get_queryset(self):
        return Schedule.objects.filter(**self.kwargs)


class ScheduleCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()


class ScheduleUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()

