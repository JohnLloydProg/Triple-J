from django.urls import path
from gym import views


urlpatterns = [
    path('program/<int:user>', views.ProgramView.as_view(), name='program'),
    path('program/current', views.CurrentProgramView.as_view(), name='current program'),
    path('program/<int:user>/create', views.ProgramCreateView.as_view(), name='program create'),
    path('program/<int:user>/delete/<int:pk>', views.ProgramDeleteView.as_view(), name='program delete'),
    path('program/<int:user>/update/<int:pk>', views.ProgramUpdateView.as_view(), name='program update'),
    path('workout/<int:program>', views.ProgramWorkoutCreateView.as_view(), name='workout'),
    path('workout/<int:program>/update/<int:pk>', views.ProgramWorkoutUpdateView.as_view(), name='workout update'),
    path('workout/<int:program>/delete/<int:pk>', views.ProgramWorkoutDeleteView.as_view(), name='workout delete'),
    path('workouts', views.WorkoutsView.as_view(), name='workouts'),
    path('workouts/<int:pk>', views.WorkoutsRetrieveView.as_view(), name='workouts retrieve'),
    path('workout-record/<int:programWorkout>', views.ProgramWorkoutRecordsView.as_view(), name='workout records'),
    path('progress', views.TimelineRecordsView.as_view(), name='progress'),
    path('progress/current', views.CurrentTimelineRecordView.as_view(), name='current progresss')

]
