from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from dietary.models import Meal, Category
from dietary.serializers import MealSerializer

# Create your views here.


class DietaryMealView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request):
        height = float(request.query_params.get('height'))
        weight = float(request.query_params.get('weight'))
        category = None
        bmi_category = ""
        if (height and weight):
            bmi = weight / (height**2)
            if (bmi < 18.5):
                bmi_category = 'UW'
            elif (bmi < 25):
                bmi_category = 'HW'
            elif (bmi < 30):
                bmi_category = 'OW'
            else:
                bmi_category = 'O'
        categories = Category.objects.filter(bmi=bmi_category)
        meals = []
        for category in categories:
            meal = MealSerializer(category.meal)
            meals.append(meal.data)
        return Response(meals)
