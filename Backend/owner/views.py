from django.shortcuts import render
from django.template.loader import render_to_string
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.views import View

# Create your views here.


class AnalyticsView(View):
    def get(self, request:HttpRequest):
        return render(request, 'analytics.html')


class LoginView(View):
    def get(self, request:HttpRequest):
        return render(request, 'login.html')
