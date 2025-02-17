from django.urls import path
from account import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('email-validation', views.EmailValidation.as_view(), name='email validation'),
    path('registration/<str:validationCode>', views.AccountRegistration.as_view(), name='account registration'),
    path('authentication', views.Authentication.as_view(), name='authentication'),
    path('token', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh', TokenRefreshView.as_view(), name='refresh'),
]
