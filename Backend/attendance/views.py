from django.shortcuts import render
from django.contrib.auth import get_user
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpRequest, JsonResponse
from .models import Member
from django.views import View

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class QRCodeGeneration(View):
    def get(self, request:HttpRequest):
        member = get_user(request)
        return HttpResponse(member.mobileNumber)

    def post(self, request:HttpRequest):
        pass
