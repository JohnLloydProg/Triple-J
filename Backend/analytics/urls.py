from django.urls import path
from analytics import views

urlpatterns = [
    path('peak/<int:month>/hours', views.PeakHoursView.as_view(), name='peak hours'),
    path('peak/<int:month>/days', views.PeakDaysView.as_view(), name='peak days'),
    path('members/report', views.MembersReportView.as_view(), name='members report'),
    path('program/types', views.WorkoutReportView.as_view(), name='program types'),
    path('sales/<int:month>', views.SalesReportView.as_view(), name='sales report')
]
