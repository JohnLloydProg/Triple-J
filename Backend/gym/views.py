from account.models import Member
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from gym.serializers import ProgramSerializer, ProgramWorkoutSerializer, WorkoutSerializer, ProgramWorkoutRecordSerializer, TimelineRecordSerializer
from django.utils.timezone import now
from gym.models import Program, ProgramWorkout, Workout, ProgramWorkoutRecord, TimelineRecord
from django.core.files.base import ContentFile
import base64

# Create your views here.


class ProgramCreateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request:Request, user:int) -> Response:
        try:
            member = Member.objects.get(pk=user)
        except Member.DoesNotExist:
            return Response('Member does not exist')

        program = Program(member=member)
        program.save()
        return Response('Successfully Created')
        


class ProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request:Request, user:int) -> Response:
        try:
            member = Member.objects.get(pk=user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        
        programs = Program.objects.filter(member=member)
        data = []
        for program in programs:
            programData = ProgramSerializer(program).data
            programWorkouts = ProgramWorkout.objects.filter(program=program)
            programData['workouts'] = [{'name':programWorkout.workout.name, 'type':programWorkout.workout.type} for programWorkout in programWorkouts]
            data.append(programData)
        return Response(data)


class CurrentProgramView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        try:
            program = Program.objects.get(member=member, day=now().weekday())            
        except Program.DoesNotExist:
            return Response({})
        
        programWorkouts = ProgramWorkout.objects.filter(program=program)
        data = {'day':program.day, 'workouts':[]}
        for programWorkout in programWorkouts:
            data['workouts'].append({programWorkout.workout.name:programWorkout.details, 'type':programWorkout.workout.type})
        return Response(data)


class ProgramUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request:Request, user:int, pk:int) -> Response:
        try:
            member = Member.objects.get(pk=user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        try:
            program = Program.objects.get(member=member, pk=pk)
        except Program.DoesNotExist:
            return Response("Program does not exist or Program is not the member's")
        
        day = request.data.get('day', -1)
        if (day < 0):
            return Response("Please provide the day to updated")
        
        program.day = day
        program.save()
        return Response(ProgramSerializer(program).data)
        

class ProgramDeleteView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request:Request, user:int, pk:int) -> Response:
        try:
            member = Member.objects.get(pk=user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        try:
            program = Program.objects.get(member=member, pk=pk)
        except Program.DoesNotExist:
            return Response("Program does not exist or Program is not the member's")
        
        program.delete()
        return Response('Successfully Deleted')



class ProgramWorkoutCreateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProgramWorkoutSerializer
    
    def get(self, request:Request, program:int) -> Response:
        programWorkouts = ProgramWorkoutSerializer(ProgramWorkout.objects.filter(program=program), many=True).data
        for programWorkout in programWorkouts:
            programWorkout['workout'] = WorkoutSerializer(Workout.objects.get(pk=programWorkout['workout'])).data
        return Response(programWorkouts)

    def post(self, request:Request, program:int) -> Response:
        try:
            program = Program.objects.get(pk=program)
        except Program.DoesNotExist:
            return Response('Program does not exist')
        try:
            workout = Workout.objects.get(pk=request.data.get('workout'))
        except Workout.DoesNotExist:
            return Response('Workout does not exist')

        programWorkout = ProgramWorkout(workout=workout, program=program, details=request.data.get('details'))
        programWorkout.save()
        return Response(ProgramWorkoutSerializer(programWorkout).data)


class ProgramWorkoutUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request:Request, program:int, pk:int) -> Response:
        try:
            programObject = Program.objects.get(pk=program)
        except Program.DoesNotExist:
            return Response('Program does not exist')
        try:
            programWorkout = ProgramWorkout.objects.get(program=programObject, pk=pk)
        except ProgramWorkout.DoesNotExist:
            return Response('ProgramWorkout does not exist')
        
        program = request.data.get('program')
        if (program):
            try:
                programObject = Program.objects.get(pk=program)
            except Program.DoesNotExist:
                return Response('Program does not exist')
            programWorkout.program = programObject
        details = request.data.get('details')
        if (details):
            programWorkout.details = details
        programWorkout.save()

        return Response(ProgramWorkoutSerializer(programWorkout).data)
    

class ProgramWorkoutDeleteView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request:Request, program:int, pk:int) -> Response:
        try:
            programObject = Program.objects.get(pk=program)
        except Program.DoesNotExist:
            return Response('Program does not exist')
        try:
            programWorkout = ProgramWorkout.objects.get(program=programObject, pk=pk)
        except ProgramWorkout.DoesNotExist:
            return Response('Workout does not exist or Workout does not belong to the Program')
        
        programWorkout.delete()
        return Response('Successfully deleted')


class WorkoutsView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request:Request) -> Response:
        return Response(WorkoutSerializer(Workout.objects.all(), many=True).data)


class ProgramWorkoutRecordsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request, programWorkout:int) -> Response:
        try:
            programWorkout = ProgramWorkout.objects.get(pk=programWorkout)
        except ProgramWorkout.DoesNotExist:
            return Response('ProgramWorkout does not exist')
        
        records = ProgramWorkoutRecord.objects.filter(programWorkout=programWorkout).order_by('-date')
        return Response(ProgramWorkoutRecordSerializer(records, many=True).data)

    def post(self, request:Request, programWorkout:int) -> Response:
        try:
            programWorkout = ProgramWorkout.objects.get(pk=programWorkout)
        except ProgramWorkout.DoesNotExist:
            return Response('ProgramWorkout does not exist')

        records = ProgramWorkoutRecord.objects.filter(programWorkout=programWorkout)
        if (len(records) == 10):
            records.first().delete()
        details = request.data.get('details')
        if (not details):
            return Response({'details':'Does not contain details'}, status=400)
        record = ProgramWorkoutRecord(programWorkout=programWorkout, details=details)
        record.save()

        return Response({'id':record.pk, 'date':record.date, 'details':record.details})


class TimelineRecordsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        
        records = TimelineRecord.objects.filter(member=member).order_by('-date')
        return Response(TimelineRecordSerializer(records, many=True).data)

    def post(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')

        if (not request.data):
            return Response('Does not contain information', status=400)
        record = TimelineRecord(member=member, height=request.data.get('height'), weight=request.data.get('weight'))
        img = request.data.get('img')
        if (img):
            record.img.save('image.jpg', ContentFile(base64.b64decode(img)))
        record.save()
        return Response('Successfully Created')


class CurrentTimelineRecordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request:Request) -> Response:
        try:
            member = Member.objects.get(pk=self.request.user)
        except Member.DoesNotExist:
            return Response('Member does not exist')
        
        records = TimelineRecord.objects.filter(member=member).order_by('-date')
        return Response(TimelineRecordSerializer(records.first()).data)

