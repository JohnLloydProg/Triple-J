from django.contrib import admin
from gym.models import Program, ProgramWorkout, Workout

# Register your models here.


models = [Program, ProgramWorkout, Workout]

for model in models:
    admin.site.register(model)
