from django.urls import path
from gym import views


urlpatterns = [
    path('email-validation', views.EmailValidation.as_view(), name='email validation'),
    path('account-registration/<str:validationCode>', views.AccountRegistration.as_view(), name='account registration'),
    path('authentication', views.Authentication.as_view(), name='authentication'),
]
