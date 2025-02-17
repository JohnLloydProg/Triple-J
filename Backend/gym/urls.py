from django.urls import path
from gym import views


urlpatterns = [
    path('program', views.ProgramCreateView.as_view(), name='program'),
    path('program/delete/<int:pk>', views.ProgramDeleteView.as_view(), name='program delete'),
    path('program/update/<int:pk>', views.ProgramUpdateView.as_view(), name='program update'),
    path('workout/<int:program>', views.WorkoutCreateView.as_view(), name='workout'),
    path('workout/<int:program>/update/<int:pk>', views.WorkUpdateView.as_view(), name='workout update'),
    path('workout/<int:program>/delete/<int:pk>', views.WorkDeleteView.as_view(), name='workout delete')
]
