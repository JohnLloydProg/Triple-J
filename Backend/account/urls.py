from django.urls import path
from account import views


urlpatterns = [
    path('email-validation', views.EmailValidation.as_view(), name='email validation'),
    path('registration/<str:validationCode>', views.AccountRegistration.as_view(), name='account registration'),
    path('authentication', views.Authentication.as_view(), name='authentication'),
]
