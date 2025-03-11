from django.shortcuts import render
from django.template.loader import render_to_string
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.views import View

# Create your views here.


class LoginView(View):
    def get(self, request:HttpRequest):
        print(render_to_string('login.html'))
        return render(request, 'login.html')
