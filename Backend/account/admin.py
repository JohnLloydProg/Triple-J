from django.contrib import admin
from .models import Member, DailyMembership, MonthlyMembership

# Register your models here.


models = [Member, DailyMembership, MonthlyMembership]

for model in models:
    admin.site.register(model)
