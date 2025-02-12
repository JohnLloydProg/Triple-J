from django.contrib import admin
from .models import Attendance, QRCode

# Register your models here.
admin.site.register(Attendance)
admin.site.register(QRCode)
