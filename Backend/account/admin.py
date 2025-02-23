from django.contrib import admin
from .models import Member, DailyMembership, MonthlyMembership, Trainer

# Register your models here.


models = [Member, DailyMembership, MonthlyMembership, Trainer]

for model in models:
    admin.site.register(model)
