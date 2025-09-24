from django.urls import path
from .views import PageListView, PageDetailView, SubmitFormView

urlpatterns = [
    path("pages/", PageListView.as_view(), name="page-list"),
    path("pages/<slug:slug>/", PageDetailView.as_view(), name="page-detail"),
    path("pages/<slug:slug>/submit/", SubmitFormView.as_view(), name="page-submit"),
]
