from django.shortcuts import render
from django.contrib.auth import get_user
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpRequest, JsonResponse
from account.models import Member, Membership
from django.contrib.sessions.backends.db import SessionStore
from attendance.models import QRCode
from django.views import View
import qrcode

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class QRCodeGeneration(View):
    def get(self, request:HttpRequest):
        request.session = SessionStore(session_key=request.headers.get('sessionId'))
        member = get_user(request)
        if (not request.user.is_authenticated):
            return JsonResponse({'details' : 'You are not logged in'}, status=401)
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
        member = get_user(request)
        if (member):
            return JsonResponse({'details' : 'You are not logged in'}, status=401)
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
