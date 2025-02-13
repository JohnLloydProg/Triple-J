from django.shortcuts import render
from django.contrib.auth import get_user
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpRequest, JsonResponse
from account.models import MonthlyMembership, DailyMembership
from attendance.models import Attendance
from django.utils.timezone import now
from django.contrib.sessions.backends.db import SessionStore
from attendance.models import QRCode
from django.views import View
import qrcode
import json

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class QRCodeGeneration(View):
    def get(self, request:HttpRequest):
        request.session = SessionStore(session_key=request.headers.get('sessionId'))
        if (not request.user.is_authenticated):
            return JsonResponse({'details' : 'You are not logged in'}, status=401)
        member = get_user(request)
        try:
            qrObject = QRCode.objects.get(member=member)
            if (qrObject.isExpired()):
                qrObject.delete()
                return JsonResponse({'details' : 'QR code is expired'}, status=401)
            response = HttpResponse(content_type='image/jpg')
            qrImage = qrcode.make(qrObject.content)
            qrImage.save(response, 'JPEG')
            return response
        except QRCode.DoesNotExist:
            return JsonResponse({'details' : 'There is no QRCode Yet'}, status=401)

    def post(self, request:HttpRequest):
        request.session = SessionStore(session_key=request.headers.get('sessionId'))
        if (not request.user.is_authenticated):
            return JsonResponse({'details' : 'You are not logged in'}, status=401)
        member = get_user(request)
        try:
            qrObject = QRCode.objects.get(member=member)
            return JsonResponse({'details' : 'The account already has a QR Code'})
        except:
            qrObject = QRCode(member=member)
            qrObject.setExpirationDate()
            qrObject.save()

            response = HttpResponse(content_type='image/jpg')
            qrImage = qrcode.make(qrObject.content)
            qrImage.save(response, 'JPEG')
            return response


@method_decorator(csrf_exempt, name='dispatch')
class Logging(View):
    def get(self, request:HttpRequest):
        attendances = Attendance.objects.filter(timeOut=None, date=now())
        return JsonResponse({'Number' : len(attendances.all())})
        
    def post(self, request:HttpRequest):
        request.session = SessionStore(session_key=request.headers.get('sessionId'))
        qrCode = json.loads(request.body.decode()).get('qrCode')
        if (not request.user.is_superuser):
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
            
