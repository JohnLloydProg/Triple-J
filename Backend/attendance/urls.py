from django.urls import path
from attendance import views


urlpatterns = [
    path('qr-code', views.QRCodeGeneration.as_view(), name='qr code'),
    path('attendance', views.AttendanceView.as_view(), name='attendance'),
]
