from django.shortcuts import render
from django.contrib.auth import get_user
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpRequest, JsonResponse
from account.models import MonthlyMembership, DailyMembership, Member
from attendance.models import Attendance
from django.utils.timezone import now
from attendance.models import QRCode
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.views import View
import qrcode
import json

# Create your views here.

class QRCodeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member = self.request.user
        try:
            qrObject = QRCode.objects.get(member=member)
            if (qrObject.isExpired()):
                qrObject.delete()
                return JsonResponse({'details' : 'QR code is expired'})
            
            response = HttpResponse(content_type='image/jpg')
            qrImage = qrcode.make(qrObject.content)
            qrImage.save(response, 'JPEG')
            return response
        except QRCode.DoesNotExist:
            return JsonResponse({'details':'Account does not have any QR code'})
    
    def post(self, request):
        member = self.request.user
        try:
            qrObject = QRCode.objects.get(member=member)
            return JsonResponse({'details' : 'The account already has a QR Code'})
        except:
            qrObject = QRCode(member=Member.objects.get(pk=member))
            qrObject.setExpirationDate()
            qrObject.save()

            response = HttpResponse(content_type='image/jpg')
            qrImage = qrcode.make(qrObject.content)
            qrImage.save(response, 'JPEG')
            return response


class LoggingView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attendances = Attendance.objects.filter(timeOut=None, date=now())
        return JsonResponse({'Number' : len(attendances.all())})
        
    def post(self, request):
        qrCode = request.data.get('qrCode')
        if (not self.request.user.is_superuser):
            return JsonResponse({'details' : 'You are not the owner!'}, status=401)
        
        try:
            qrObject = QRCode.objects.get(content=qrCode)
            if (now().date() > qrObject.expirationDate):
                qrObject.delete()
                return JsonResponse({'details' : 'QR code is expired'})
            member = qrObject.member
        except QRCode.DoesNotExist:
            return JsonResponse({'details' : 'QR code does not exist'})
        
        try:
            attendance = Attendance.objects.get(member=member, date=now())
            attendance.logOut()
            attendance.save()
            return JsonResponse({'details' : 'Successfuly logged out'})
        except Attendance.DoesNotExist:
            attendance = Attendance(member=member)
            attendance.save()
            data = {}
            data['details'] = 'Successfuly logged in'
            if (member.membershipType == 'Daily'):
                data['price'] = DailyMembership.objects.get(member=member).price
                data['paid'] = False
            else:
                membership = MonthlyMembership.objects.get(member=member)
                data['price'] = membership.price
                data['paid'] = False if (now().date() > membership.expirationDate) else True
            return JsonResponse(data)
            
