from django.shortcuts import render
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Announcement
from .serializers import AnnouncementSerializer
from django.core.files.base import ContentFile
from django.utils.timezone import now
import base64

# Create your views here.


class AnnouncementsView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        announcements = Announcement.objects.all().order_by('-created_at')
        return Response(AnnouncementSerializer(announcements, many=True).data)

    def post(self, request: Request) -> Response:
        if (not self.request.user.is_superuser):
            return Response('You are not the owner')
        
        title = request.data.get('title')
        content = request.data.get('content', '')
        img = request.data.get('img')
        if not title:
            return Response('Title is required')

        announcement = Announcement(title=title, content=content)
        if (img):
            announcement.image.save('image.jpg', ContentFile(base64.b64decode(img)))
        announcement.save()
        return Response('Successfully created announcement')
    

class AnnouncementView(GenericAPIView):
    permmission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request: Request, pk: int) -> Response:
        if (not self.request.user.is_superuser):
            return Response('You are not the owner')
        
        title = request.data.get('title', '')
        content = request.data.get('content', '')
        img = request.data.get('img')

        try:
            announcement = Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return Response('Announcement not found')
        
        if (title):
            announcement.title = title
            announcement.updated_at = now()
        if (content):
            announcement.content = content
            announcement.updated_at = now()
        if (img):
            announcement.image.save('image.jpg', ContentFile(base64.b64decode(img)))
            announcement.updated_at = now()

        announcement.save()
        return Response('Successfully updated announcement')

    def delete(self, request: Request, pk: int) -> Response:
        if (not self.request.user.is_superuser):
            return Response('You are not the owner')
        
        try:
            announcement = Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return Response('Announcement not found')
        
        announcement.delete()
        return Response('Successfully deleted announcement')


class LatestAnnouncementView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        try:
            announcement = Announcement.objects.latest('updated_at')
        except Announcement.DoesNotExist:
            return Response('No announcements found')
        
        return Response(AnnouncementSerializer(announcement).data)
