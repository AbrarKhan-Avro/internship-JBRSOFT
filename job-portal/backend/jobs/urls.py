# backend/jobs/urls.py
from django.urls import path
from .views import PageDetailAPIView, PageSubmitAPIView

urlpatterns = [
    path("pages/<slug:slug>/", PageDetailAPIView.as_view(), name="page-detail"),
    path("pages/<slug:slug>/submit/", PageSubmitAPIView.as_view(), name="page-submit"),
]
