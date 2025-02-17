from django.contrib import admin
from gym.models import Program, Workout

# Register your models here.


models = [Program, Workout]

for model in models:
    admin.site.register(model)
