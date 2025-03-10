from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from attendance.models import Attendance
from account.models import Member, MonthlyMembership, DailyMembership, MemberCheckout
from gym.models import ProgramWorkout
from django.http.response import JsonResponse
from django.utils.timezone import now
from django.db.models import Model

# Create your views here.

def objectsThisMonth(_object, month, **kwargs):
    objects = []
    for obj in _object.objects.filter(**kwargs):
        if (obj.date.month == month):
            objects.append(obj)
    return objects

class PeakHoursView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, month):
        hourRecords = {hour:0 for hour in range(0, 24)}
        hours = [(attendance.timeIn.hour, attendance.timeOut.hour) for attendance in objectsThisMonth(Attendance, month)]
        for inOut in hours:
            for inHour in range(inOut[0], inOut[1]+1):
                hourRecords[inHour] += 1
        return JsonResponse(hourRecords)


class PeakDaysView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, month):
        dayRecords = {day:0 for day in range(7)}
        days = [attendance.date.weekday() for attendance in objectsThisMonth(Attendance, month)]
        for day in days:
            dayRecords[day] += 1
        return JsonResponse(dayRecords)


class MembersReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        response = {}
        response['number'] = len(Member.objects.all())
        response['demographics'] = {}
        response['demographics']['M'] = len(Member.objects.filter(sex='M'))
        response['demographics']['F'] = len(Member.objects.filter(sex='F'))
        response['membership'] = {}
        response['membership']['Monthly'] = len(MonthlyMembership.objects.all())
        response['membership']['Daily'] = len(DailyMembership.objects.all())
        return JsonResponse(response)


class SalesReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, month):
        response = {'daily':0, 'monthly':0}
        for attendance in objectsThisMonth(Attendance, month):
            if (attendance.member.membershipType == 'Daily'):
                response['daily'] += 100
        for memberCheckout in objectsThisMonth(MemberCheckout, month, type='membership'):
            response['monthly'] += memberCheckout.price
        return JsonResponse(response)


class WorkoutReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        programTypes = {pType:0 for pType in ['L', 'C', 'U', 'PS', 'PL']}
        for programWorkout in ProgramWorkout.objects.all():
            programTypes[programWorkout.workout.type] += 1
        return JsonResponse(programTypes)

