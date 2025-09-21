from django.urls import path
from . import views

urlpatterns = [
    path('dynamic-fields/', views.get_dynamic_fields),
    path('jobs/', views.JobListCreate.as_view()),
    path('jobs/<int:pk>/', views.JobDetail.as_view()),
    path('jobs/<int:pk>/apply/', views.ApplyJob.as_view()),
    path('users/register/', views.UserRegister.as_view()),
]
