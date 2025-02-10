from django.urls import path
from attendance import views


urlpatterns = [
    path('qr-code', views.QRCodeGeneration.as_view(), name='qr code')
]
