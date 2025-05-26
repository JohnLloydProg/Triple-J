from django.contrib import admin
from .models import Member, DailyMembership, MonthlyMembership, ValidationSession

# Register your models here.


models = [Member, DailyMembership, MonthlyMembership, ValidationSession]

for model in models:
    admin.site.register(model)
