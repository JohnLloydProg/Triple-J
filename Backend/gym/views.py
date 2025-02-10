
from django.contrib.auth import authenticate, get_user
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render, redirect
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.views import View
from datetime import date
from . import models
import smtplib
import uuid
import ssl

# Create your views here.


@method_decorator(csrf_exempt, name='dispatch')
class MyView(View):
    def get(self, request:HttpRequest):
        return HttpResponse("Response to get method")

    def post(self, request:HttpRequest):
        return HttpResponse("Response to post method")