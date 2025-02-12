from django.contrib.auth import authenticate
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


class EmailValidation(View):
    """
    View responsible for sending and creating the validation session to the user's email address for validation and account registration.
    The get method simple provides the form for providing the user's email. The post method uses that email to check if an account is already linked to the email.
    If not, create a validation and send a message to that email for registration.
    """

    context = ssl.create_default_context()

    def get(self, request:HttpRequest):
        return render(request, 'form.html')

    def post(self, request:HttpRequest):
        memberEmail = request.POST.get('email')
        try:
            member = models.Member.objects.get(email=memberEmail)
        except models.Member.DoesNotExist:
            validationSession = models.ValidationSession(email=memberEmail)
            validationSession.setExpirationDate()
            validationSession.save()

            validationMSG = MIMEMultipart()
            validationMSG['Subject'] = "Email Validation for Tripple J System"
            html = f"""
            <html>
                <body>
                    <p>Hello, this is the link for the account registration: <a href='http://127.0.0.1:8000/api/account/registration/{str(validationSession.validationCode)}'>http://127.0.0.1:8000/api/account/registration/{str(validationSession.validationCode)}</a></p>
                </body>
            </html>
            """
            validationMSG.attach(MIMEText(html, 'html'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=self.context) as smtp:
                smtp.login("johnlloydunida0@gmail.com", "hvwm jkkz gamd nvnn")
                smtp.sendmail("johnlloydunida0@gmail.com", [memberEmail], validationMSG.as_string())

            return HttpResponse("Email sent successfully")
        return HttpResponse("Email is already registered in the system")


#REMINDER TEST REGISTRATION
class AccountRegistration(View):
    """
    View that handles the account registration. The get method checks if the validation session is still valid and gives the registration form.
    The post method handles the registration of the account into the database.
    """

    def get(self, request:HttpRequest, validationCode:str):
        try:
            validationSession = models.ValidationSession.objects.get(validationCode=validationCode)
            if (date.today() > validationSession.expirationDate):
                return HttpResponse('Validation Session Expired!')
            return render(request, 'register.html')
        except models.ValidationSession.DoesNotExist:
            return HttpResponse('Validation Code does not exist!')
    
    def post(self, request:HttpRequest, validationCode:str):
        email = models.ValidationSession.objects.get(pk=validationCode).email
        username = request.POST.get('username')
        firstName = request.POST.get('firstName')
        lastName = request.POST.get('lastName')
        password = request.POST.get('password')
        mobileNumber = request.POST.get('mobileNumber')

        membership = models.MonthlyMembership(membershipType='Monthly')
        membership.extendExpirationDate()
        membership.save()

        member = models.Member(username=username, email=email, first_name=firstName, last_name=lastName, mobileNumber=mobileNumber, membership=membership)
        member.set_password(password)
        member.save()

        data = {member.pk : member.json()}

        return JsonResponse(data=data)
    
@method_decorator(csrf_exempt, name='dispatch')
class Authentication(View):
    """
    The view that handles the authentication system. The get method could have two outcomes. The first one is the ordinary login page.
    The second one is where the refresh token was provided and tested to use for authentication. The post method provides the account details of the user upon
    authentication in JSON format.
    """

    def get(self, request:HttpRequest):
        token = request.GET.get('token')
        member = authenticate(token=token)
        if (member):
            data = {member.pk : member.json(), 'sessionId': request.session.session_key}
            return JsonResponse(data)
        else:
            return render(request, 'login.html')

    def post(self, request:HttpRequest):
        email = request.headers.get('Email')
        password = request.headers.get('Password')
        member = authenticate(request, email=email, password=password)
        if (member):
            refreshToken = models.RefreshToken(member=member)
            refreshToken.setExpirationDate()
            refreshToken.save()
            data = {member.pk : member.json(), 'refreshToken': refreshToken.token, 'sessionId': request.session.session_key}
            return JsonResponse(data)
        return JsonResponse({'details' : 'Authentication failed!'})
