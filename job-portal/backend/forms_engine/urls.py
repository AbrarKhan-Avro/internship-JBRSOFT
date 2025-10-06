from django.urls import path
from . import views

urlpatterns = [
    path('pages/', views.PageListView.as_view(), name='page-list'),
    path('pages/<slug:slug>/', views.PageDetailView.as_view(), name='page-detail'),
    path('submit/<slug:slug>/', views.FormSubmissionView.as_view(), name='form-submit'),
]
