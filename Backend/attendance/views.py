from account.models import MonthlyMembership, DailyMembership, Member
from attendance.models import Attendance
from django.utils.timezone import now
from attendance.models import QRCode
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from attendance.serializers import QRCodeSerializer, AttendanceSerializer
from datetime import date

# Create your views here.

class QRCodeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        try:
            qrObject = QRCode.objects.get(member=member)
        except QRCode.DoesNotExist:
            return Response('Account does not have any QR code')
        
        if (qrObject.isExpired()):
            qrObject.delete()
            return Response('QR code is expired')
        return Response(QRCodeSerializer(qrObject).data)
    
    def post(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        try:
            qrObject = QRCode.objects.get(member=member)
            return Response('The account already has a QR Code')
        except:
            qrObject = QRCode(member=Member.objects.get(pk=member))
            qrObject.generate()
            qrObject.setExpirationDate()
            qrObject.save()
            return Response('Success')


class LoggingView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        attendances = Attendance.objects.filter(timeOut=None, date=now())
        ratio = {}
        for attendance in attendances:
            ratio[attendance.member.sex] = ratio.get(attendance.member.sex, 0) + 1
        return Response({'Number' : len(attendances.all()), 'Ratio':ratio})
        
    def post(self, request:Request) -> Response:
        qrCode = request.data.get('qrCode')
        if (not self.request.user.is_superuser):
            return Response('You are not the owner!')

        try:
            qrObject = QRCode.objects.get(content=qrCode)
        except QRCode.DoesNotExist:
            return Response('QR code does not exist')
        
        if (now().date() > qrObject.expirationDate):
            qrObject.delete()
            return Response('QR code is expired')

        try:
            attendance = Attendance.objects.get(member=qrObject.member, date=now())
            attendance.logOut()
            attendance.save()
            return Response('Successfuly logged out')
        except Attendance.DoesNotExist:
            attendance = Attendance(member=qrObject.member)
            attendance.save()
            data = {}
            data['details'] = 'Successfuly logged in'
            data['name'] = f'{qrObject.member.first_name} {qrObject.member.last_name}'
            data['type'] = qrObject.member.membershipType
            if (qrObject.member.membershipType == 'Daily'):
                data['price'] = DailyMembership.objects.get(member=qrObject.member).price
                data['paid'] = False
            else:
                membership = MonthlyMembership.objects.get(member=qrObject.member)
                data['price'] = membership.price
                data['expiry'] = membership.expirationDate
                data['paid'] = False if (now().date() > membership.expirationDate) else True
            return Response(data)
    

class AttendanceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request:Request, year:int, month:int, day:int) -> Response:
        attendances = Attendance.objects.filter(date=date(year, month, day)).order_by('timeIn')
        data = AttendanceSerializer(attendances, many=True).data
        for attendance in data:
            attendance['member'] = Member.objects.get(pk=attendance['member'])
        return Response(data)
            
