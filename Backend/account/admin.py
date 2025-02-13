from django.contrib import admin
from .models import Member, Membership, DailyMembership, MonthlyMembership

# Register your models here.
admin.site.register(Member)
admin.site.register(DailyMembership)
admin.site.register(MonthlyMembership)
