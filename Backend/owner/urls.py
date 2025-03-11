from django.urls import path
from owner import views


urlpatterns = [
    path('', views.LoginView.as_view(), name='login page'),
]
