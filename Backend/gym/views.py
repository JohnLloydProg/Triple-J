
from django.contrib.auth import authenticate, get_user
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


class EmailValidation(View):
    context = ssl.create_default_context()

    def get(self, request:HttpRequest):
        return render(request, 'form.html')

    def post(self, request:HttpRequest):
        memberEmail = request.POST.get('email')
        try:
            models.Member.objects.get(email=memberEmail)
        except models.Member.DoesNotExist:
            validationSession = models.ValidationSession(email=memberEmail)
            validationSession.save()

            validationMSG = MIMEMultipart()
            validationMSG['Subject'] = "Email Validation for Tripple J System"
            html = f"""
            <html>
                <body>
                    <p>Hello, this is the link for the account registration: <a href='http://127.0.0.1:8000/account-registration/{str(validationSession.validationCode)}'>http://127.0.0.1:8000/account-registration/{str(validationSession.validationCode)}</a></p>
                </body>
            </html>
            """
            validationMSG.attach(MIMEText(html, 'html'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=self.context) as smtp:
                smtp.login("johnlloydunida0@gmail.com", "hvwm jkkz gamd nvnn")
                smtp.sendmail("johnlloydunida0@gmail.com", [memberEmail], validationMSG.as_string())

            return HttpResponse("Email sent successfully")
        return HttpResponse("Email is already registered in the system")

class AccountRegistration(View):
    def get(self, request:HttpRequest, validationCode:str):
        validationSession = models.ValidationSession.objects.get(validationCode=validationCode)
        if (date.today() > validationSession.dueDate):
            return HttpResponse('Validation Session Expired!')
        return render(request, 'register.html')
    
    def post(self, request:HttpRequest, validationCode:str):
        email = models.ValidationSession.objects.get(pk=validationCode).email
        firstName = request.POST.get('firstName')
        lastName = request.POST.get('lastName')
        password = request.POST.get('password')
        mobileNumber = request.POST.get('mobileNumber')
        membership = models.MonthlyMembership(membershipType='Monthly')
        membership.save()

        member = models.Member(email=email, firstName=firstName, lastName=lastName, password=password, mobileNumber=mobileNumber, membership=membership)
        member.save()

        data = {member.pk : member.json()}

        return JsonResponse(data=data)
    

class LogIn(View):
    def get(self, request:HttpRequest):
        token = request.GET.get('token')
        member = authenticate(token=token)
        if (member):
            data = {member.pk : member.json()}
            return JsonResponse(data)
        else:
            return render(request, 'login.html')

    def post(self, request:HttpRequest):
        email = request.POST.get('email')
        password = request.POST.get('password')
        member = authenticate(request, email=email, password=password)
        if (member):
            refreshToken = models.RefreshToken(member=member)
            refreshToken.save()
            data = {member.pk : member.json(), 'refreshToken': refreshToken.token}
            return JsonResponse(data)
        return HttpResponse("Login Unsuccessful")
