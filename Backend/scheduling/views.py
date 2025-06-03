from rest_framework import generics
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsTrainer
from scheduling.serializers import ScheduleSerializer
from scheduling.models import Schedule
from account.models import Member
from rest_framework import status
from django.utils.timezone import now

# Create your views here.


class SchedulesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    
    def get(self, request:Request) -> Response:
        schedules = []
        try:
            trainer = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Trainer does not exist')
        
        for schedule in Schedule.objects.all():
            if (schedule.trainee.gymTrainer == trainer):
                schedules.append(ScheduleSerializer(schedule).data)
        return Response(schedules)


class NextScheduleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        
        schedules = Schedule.objects.filter(trainee=member).order_by('-datetime')
        if not schedules:
            return Response('No schedules found for this member', status=status.HTTP_404_NOT_FOUND)
        return Response(ScheduleSerializer(schedules[0]).data)


class ScheduleCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()


class ScheduleUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer
    queryset = Schedule.objects.all()

