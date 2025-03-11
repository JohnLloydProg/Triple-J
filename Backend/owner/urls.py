from django.urls import path
from owner import views


urlpatterns = [
    path('', views.LoginView.as_view(), name='login'),
    path('analytics', views.AnalyticsView.as_view(), name='analytics')
]
